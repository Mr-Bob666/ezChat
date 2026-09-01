import { Op } from 'sequelize';
import { Message, User } from '../models/index.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { isMember } from './roomService.js';

const RECALL_WINDOW_MS = 2 * 60 * 1000; // 2 minutes

export async function create(userId, roomId, content, { type = 'text', imageUrl = null } = {}) {
  const member = await isMember(roomId, userId);
  if (!member) throw new ForbiddenError('You are not a member of this room');

  const message = await Message.create({
    room_id: roomId,
    user_id: userId,
    content: content || '',
    type,
    image_url: imageUrl,
  });
  // Reload with sender info
  const fullMessage = await Message.findByPk(message.id, {
    include: [{ model: User, as: 'sender', attributes: ['id', 'username', 'avatar_url'] }],
  });
  return fullMessage;
}

export async function recall(messageId, userId) {
  const message = await Message.findByPk(messageId);
  if (!message) throw new NotFoundError('消息不存在');
  if (message.user_id !== userId) throw new ForbiddenError('只能撤回自己的消息');
  if (message.is_recalled) throw new ForbiddenError('消息已被撤回');

  const elapsed = Date.now() - new Date(message.created_at).getTime();
  if (elapsed > RECALL_WINDOW_MS) {
    throw new ForbiddenError('消息发送超过2分钟，无法撤回');
  }

  message.is_recalled = true;
  await message.save();
  return message;
}

export async function getByRoom(roomId, { before, limit = 50 }) {
  const where = { room_id: roomId };
  if (before) {
    where.id = { [Op.lt]: before };
  }

  const messages = await Message.findAll({
    where,
    include: [{ model: User, as: 'sender', attributes: ['id', 'username', 'avatar_url'] }],
    order: [['created_at', 'DESC']],
    limit,
  });

  // Return in chronological order (oldest first)
  return messages.reverse();
}
