import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import config from '../config/index.js';
import { Admin, User, Room, RoomMember, RoomBan, Message } from '../models/index.js';
import { UnauthorizedError, NotFoundError, ValidationError } from '../utils/errors.js';

function generateAdminToken(adminId) {
  return jwt.sign({ adminId, type: 'admin' }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

export async function login({ username, password }) {
  const admin = await Admin.findOne({ where: { username } });
  if (!admin) {
    throw new UnauthorizedError('用户名或密码错误');
  }
  const isMatch = await admin.verifyPassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('用户名或密码错误');
  }
  admin.last_login_at = new Date();
  await admin.save();
  const token = generateAdminToken(admin.id);
  return { admin: { id: admin.id, username: admin.username }, token };
}

export async function getStats() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [userCount, roomCount, messageCount, onlineCount, todayMessageCount] = await Promise.all([
    User.count(),
    Room.count(),
    Message.count(),
    User.count({ where: { is_online: true } }),
    Message.count({ where: { created_at: { [Op.gte]: todayStart } } }),
  ]);
  return { userCount, roomCount, messageCount, onlineCount, todayMessageCount };
}

export async function listUsers({ keyword = '', page = 1, pageSize = 10 }) {
  const where = keyword
    ? {
        [Op.or]: [
          { username: { [Op.like]: `%${keyword}%` } },
          { email: { [Op.like]: `%${keyword}%` } },
        ],
      }
    : {};
  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password_hash'] },
    order: [['created_at', 'DESC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });
  return { total: count, users: rows };
}

export async function setUserDisabled(userId, disabled) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('用户不存在');
  }
  await user.update({ is_disabled: disabled });
  return { message: disabled ? '用户已禁用' : '用户已启用' };
}

export async function resetUserPassword(userId, newPassword) {
  if (!newPassword || newPassword.length < 6) {
    throw new ValidationError('新密码长度至少为 6 位');
  }
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('用户不存在');
  }
  user.password_hash = newPassword;
  await user.save();
  return { message: '密码重置成功' };
}

export async function listRooms({ keyword = '', page = 1, pageSize = 10 }) {
  const where = keyword ? { name: { [Op.like]: `%${keyword}%` } } : {};
  const { count, rows } = await Room.findAndCountAll({
    where,
    include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }],
    order: [['created_at', 'DESC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const roomIds = rows.map((r) => r.id);
  const memberCounts = roomIds.length
    ? await RoomMember.findAll({
        attributes: ['room_id', [sequelize.fn('COUNT', sequelize.col('RoomMember.id')), 'memberCount']],
        where: { room_id: roomIds, left_at: null },
        group: ['room_id'],
        raw: true,
      })
    : [];
  const countMap = Object.fromEntries(memberCounts.map((m) => [m.room_id, Number(m.memberCount)]));

  const rooms = rows.map((room) => ({
    ...room.get(),
    memberCount: countMap[room.id] || 0,
  }));
  return { total: count, rooms };
}

export async function listRoomMembers(roomId) {
  const room = await Room.findByPk(roomId);
  if (!room) {
    throw new NotFoundError('房间不存在');
  }
  const members = await RoomMember.findAll({
    where: { room_id: roomId, left_at: null },
    include: [{ model: User, attributes: ['id', 'username', 'email', 'avatar_url', 'is_online'] }],
    order: [['joined_at', 'ASC']],
  });
  return { room, members };
}

export async function deleteRoom(roomId) {
  const room = await Room.findByPk(roomId);
  if (!room) {
    throw new NotFoundError('房间不存在');
  }
  await sequelize.transaction(async (t) => {
    await Message.destroy({ where: { room_id: roomId }, transaction: t });
    await RoomBan.destroy({ where: { room_id: roomId }, transaction: t });
    await RoomMember.destroy({ where: { room_id: roomId }, transaction: t });
    await room.destroy({ transaction: t });
  });
  return { message: '房间已解散' };
}

export async function listMessages({ roomId, userId, page = 1, pageSize = 20 }) {
  const where = {};
  if (roomId) where.room_id = roomId;
  if (userId) where.user_id = userId;
  const { count, rows } = await Message.findAndCountAll({
    where,
    include: [
      { model: User, as: 'sender', attributes: ['id', 'username', 'avatar_url'] },
      { model: Room, as: 'room', attributes: ['id', 'name'] },
    ],
    order: [['created_at', 'DESC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });
  return { total: count, messages: rows };
}

export async function deleteMessage(messageId) {
  const message = await Message.findByPk(messageId);
  if (!message) {
    throw new NotFoundError('消息不存在');
  }
  await message.destroy();
  return { message: '消息已删除' };
}

/**
 * Recommend public rooms for a user via lightweight collaborative filtering:
 * members of the rooms the user has joined → other rooms those members joined
 * → rank by number of overlapping members.
 */
export async function recommendRooms(userId, limit = 10) {
  const user = await User.findByPk(userId, { attributes: ['id', 'username'] });
  if (!user) {
    throw new NotFoundError('用户不存在');
  }

  const activeMembership = { user_id: userId, left_at: null };
  const myMemberships = await RoomMember.findAll({ where: activeMembership, attributes: ['room_id'], raw: true });
  const myRoomIds = myMemberships.map((m) => m.room_id);

  if (myRoomIds.length === 0) {
    // Fallback: recommend the most active public rooms
    return recommendPopularRooms(userId, [], limit);
  }

  // Co-members: other active users in my rooms
  const coMemberships = await RoomMember.findAll({
    where: { room_id: myRoomIds, left_at: null, user_id: { [Op.ne]: userId } },
    attributes: ['user_id'],
    group: ['user_id'],
    raw: true,
  });
  const coUserIds = coMemberships.map((m) => m.user_id);

  if (coUserIds.length === 0) {
    return recommendPopularRooms(userId, myRoomIds, limit);
  }

  // Other rooms those co-members joined, ranked by overlapping member count
  const candidates = await RoomMember.findAll({
    attributes: ['room_id', [sequelize.fn('COUNT', sequelize.col('RoomMember.id')), 'score']],
    where: {
      user_id: coUserIds,
      left_at: null,
      room_id: { [Op.notIn]: myRoomIds },
    },
    group: ['room_id'],
    order: [[sequelize.literal('score'), 'DESC']],
    limit,
    raw: true,
  });

  const roomIds = candidates.map((c) => c.room_id);
  const rooms = roomIds.length
    ? await Room.findAll({ where: { id: roomIds, is_private: false }, raw: true })
    : [];
  const roomMap = Object.fromEntries(rooms.map((r) => [r.id, r]));

  const recommendations = candidates
    .filter((c) => roomMap[c.room_id])
    .map((c) => ({
      room: roomMap[c.room_id],
      score: Number(c.score),
      reason: `${c.score} 位与你同房间的成员也在这里`,
    }));

  return { user, recommendations };
}

async function recommendPopularRooms(userId, excludeRoomIds, limit) {
  const where = { left_at: null, user_id: { [Op.ne]: userId } };
  if (excludeRoomIds.length) {
    where.room_id = { [Op.notIn]: excludeRoomIds };
  }
  const candidates = await RoomMember.findAll({
    attributes: ['room_id', [sequelize.fn('COUNT', sequelize.col('RoomMember.id')), 'score']],
    where,
    group: ['room_id'],
    order: [[sequelize.literal('score'), 'DESC']],
    limit,
    raw: true,
  });
  const roomIds = candidates.map((c) => c.room_id);
  const rooms = roomIds.length
    ? await Room.findAll({ where: { id: roomIds, is_private: false }, raw: true })
    : [];
  const roomMap = Object.fromEntries(rooms.map((r) => [r.id, r]));
  const recommendations = candidates
    .filter((c) => roomMap[c.room_id])
    .map((c) => ({
      room: roomMap[c.room_id],
      score: Number(c.score),
      reason: '热门房间',
    }));
  return { user: await User.findByPk(userId, { attributes: ['id', 'username'] }), recommendations };
}
