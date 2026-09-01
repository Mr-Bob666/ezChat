import * as roomService from '../services/roomService.js';

export async function listRooms(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await roomService.listPublicRooms({ page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function listJoinedRooms(req, res, next) {
  try {
    const rooms = await roomService.listJoinedRooms(req.user.userId);
    res.json({ rooms });
  } catch (err) {
    next(err);
  }
}

export async function createRoom(req, res, next) {
  try {
    const room = await roomService.createRoom({
      name: req.body.name,
      description: req.body.description,
      isPrivate: req.body.is_private,
      createdBy: req.user.userId,
    });
    res.status(201).json({ room });
  } catch (err) {
    next(err);
  }
}

export async function getRoom(req, res, next) {
  try {
    const room = await roomService.findById(req.params.roomId, req.user.userId);
    res.json({ room });
  } catch (err) {
    next(err);
  }
}

export async function joinRoom(req, res, next) {
  try {
    const member = await roomService.joinRoom(req.params.roomId, req.user.userId);
    res.json({ member });
  } catch (err) {
    next(err);
  }
}

export async function leaveRoom(req, res, next) {
  try {
    const member = await roomService.leaveRoom(req.params.roomId, req.user.userId);
    res.json({ member });
  } catch (err) {
    next(err);
  }
}

export async function getMembers(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const result = await roomService.getMembers(req.params.roomId, { page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteRoom(req, res, next) {
  try {
    await roomService.deleteRoom(req.params.roomId, req.user.userId);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    next(err);
  }
}

export async function setRole(req, res, next) {
  try {
    const roomId = req.params.roomId;
    const member = await roomService.setRole(
      roomId,
      req.user.userId,
      parseInt(req.params.userId),
      req.body.role,
    );
    req.app.get('io')?.to(`room:${roomId}`).emit('room:member_updated', { roomId: parseInt(roomId) });
    res.json({ member });
  } catch (err) {
    next(err);
  }
}

export async function muteMember(req, res, next) {
  try {
    const roomId = req.params.roomId;
    const member = await roomService.muteMember(
      roomId,
      req.user.userId,
      parseInt(req.params.userId),
    );
    req.app.get('io')?.to(`room:${roomId}`).emit('room:member_updated', { roomId: parseInt(roomId) });
    res.json({ member });
  } catch (err) {
    next(err);
  }
}

export async function unmuteMember(req, res, next) {
  try {
    const roomId = req.params.roomId;
    const member = await roomService.unmuteMember(
      roomId,
      req.user.userId,
      parseInt(req.params.userId),
    );
    req.app.get('io')?.to(`room:${roomId}`).emit('room:member_updated', { roomId: parseInt(roomId) });
    res.json({ member });
  } catch (err) {
    next(err);
  }
}

export async function kickMember(req, res, next) {
  try {
    const roomId = req.params.roomId;
    const targetUserId = parseInt(req.params.userId);
    const member = await roomService.kickMember(
      roomId,
      req.user.userId,
      targetUserId,
      req.body.reason,
    );
    const io = req.app.get('io');
    if (io) {
      io.to(`room:${roomId}`).emit('room:member_kicked', {
        roomId: parseInt(roomId),
        userId: targetUserId,
      });
    }
    res.json({ member });
  } catch (err) {
    next(err);
  }
}

export async function getBannedMembers(req, res, next) {
  try {
    const bans = await roomService.getBannedMembers(req.params.roomId, req.user.userId);
    res.json({ bans });
  } catch (err) {
    next(err);
  }
}

export async function unbanMember(req, res, next) {
  try {
    await roomService.unbanMember(
      req.params.roomId,
      req.user.userId,
      parseInt(req.params.userId),
    );
    res.json({ message: 'Unbanned' });
  } catch (err) {
    next(err);
  }
}

export async function joinByInviteCode(req, res, next) {
  try {
    const { room, member } = await roomService.joinByInviteCode(
      req.body.invite_code,
      req.user.userId,
    );
    res.json({ room, member });
  } catch (err) {
    next(err);
  }
}

export async function regenerateInviteCode(req, res, next) {
  try {
    const room = await roomService.regenerateInviteCode(
      req.params.roomId,
      req.user.userId,
    );
    res.json({ room });
  } catch (err) {
    next(err);
  }
}
