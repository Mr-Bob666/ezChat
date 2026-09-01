import * as messageService from '../services/messageService.js';
import { isMember } from '../services/roomService.js';
import { ForbiddenError } from '../utils/errors.js';

export async function getMessages(req, res, next) {
  try {
    const before = req.query.before ? parseInt(req.query.before) : null;
    const limit = parseInt(req.query.limit) || 50;
    const messages = await messageService.getByRoom(req.params.roomId, { before, limit });
    res.json({ messages });
  } catch (err) {
    next(err);
  }
}

export async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择图片' });
    }

    const roomId = req.params.roomId;
    const userId = req.user.userId;
    const member = await isMember(roomId, userId);
    if (!member) throw new ForbiddenError('你不是该房间的成员');

    const imageUrl = `/uploads/messages/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (err) {
    next(err);
  }
}
