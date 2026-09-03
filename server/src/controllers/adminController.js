import * as adminService from '../services/adminService.js';

export async function login(req, res, next) {
  try {
    const result = await adminService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getStats(req, res, next) {
  try {
    const stats = await adminService.getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req, res, next) {
  try {
    const { keyword, page, pageSize } = req.query;
    const result = await adminService.listUsers({
      keyword,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function disableUser(req, res, next) {
  try {
    const result = await adminService.setUserDisabled(req.params.id, true);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function enableUser(req, res, next) {
  try {
    const result = await adminService.setUserDisabled(req.params.id, false);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function resetUserPassword(req, res, next) {
  try {
    const result = await adminService.resetUserPassword(req.params.id, req.body.newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function listRooms(req, res, next) {
  try {
    const { keyword, page, pageSize } = req.query;
    const result = await adminService.listRooms({
      keyword,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function listRoomMembers(req, res, next) {
  try {
    const result = await adminService.listRoomMembers(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteRoom(req, res, next) {
  try {
    const result = await adminService.deleteRoom(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function listMessages(req, res, next) {
  try {
    const { roomId, userId, page, pageSize } = req.query;
    const result = await adminService.listMessages({
      roomId: roomId ? Number(roomId) : undefined,
      userId: userId ? Number(userId) : undefined,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 20,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteMessage(req, res, next) {
  try {
    const result = await adminService.deleteMessage(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function recommendRooms(req, res, next) {
  try {
    const result = await adminService.recommendRooms(req.params.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
