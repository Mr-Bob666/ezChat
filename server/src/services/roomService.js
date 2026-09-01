import { Sequelize, Op } from 'sequelize';
import crypto from 'crypto';
import { Room, RoomMember, RoomBan, User, Message } from '../models/index.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

const ROLE_PRIORITY = { owner: 3, admin: 2, member: 1 };

// ─── helpers ───

function generateInviteCode() {
  return crypto.randomBytes(5).toString('hex').substring(0, 8).toUpperCase();
}

async function findActiveMember(roomId, userId) {
  return RoomMember.findOne({ where: { room_id: roomId, user_id: userId, left_at: null } });
}

function assertHigherRole(operatorRole, targetRole) {
  if (ROLE_PRIORITY[operatorRole] <= ROLE_PRIORITY[targetRole]) {
    throw new ForbiddenError('权限不足');
  }
}

// ─── room CRUD ───

export async function listPublicRooms({ page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  const { count, rows } = await Room.findAndCountAll({
    where: { is_private: false },
    include: [
      { model: User, as: 'creator', attributes: ['id', 'username'] },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
    distinct: true,
  });
  const roomsWithCount = await Promise.all(rows.map(async (room) => {
    const memberCount = await RoomMember.count({
      where: { room_id: room.id, left_at: null },
    });
    return { ...room.toJSON(), member_count: memberCount };
  }));
  return { rooms: roomsWithCount, total: count, page, totalPages: Math.ceil(count / limit) };
}

export async function listJoinedRooms(userId) {
  const memberships = await RoomMember.findAll({
    where: { user_id: userId, left_at: null },
    attributes: ['room_id'],
  });
  const roomIds = memberships.map(m => m.room_id);
  if (roomIds.length === 0) return [];

  const rooms = await Room.findAll({
    where: { id: { [Op.in]: roomIds }, is_private: true },
    include: [
      { model: User, as: 'creator', attributes: ['id', 'username'] },
    ],
    order: [['created_at', 'DESC']],
  });

  return Promise.all(rooms.map(async (room) => {
    const memberCount = await RoomMember.count({
      where: { room_id: room.id, left_at: null },
    });
    return { ...room.toJSON(), member_count: memberCount };
  }));
}

export async function createRoom({ name, description, isPrivate, createdBy }) {
  const baseData = {
    name,
    description: description || null,
    is_private: isPrivate || false,
    created_by: createdBy,
  };

  if (!isPrivate) {
    const room = await Room.create(baseData);
    await RoomMember.create({ room_id: room.id, user_id: createdBy, role: 'owner' });
    return room;
  }

  // Private room: generate invite code with collision retry
  let lastError;
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      const room = await Room.create({
        ...baseData,
        invite_code: generateInviteCode(),
      });
      await RoomMember.create({ room_id: room.id, user_id: createdBy, role: 'owner' });
      return room;
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError' && err.errors[0]?.path === 'invite_code') {
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export async function findById(roomId, userId) {
  const room = await Room.findByPk(roomId, {
    include: [
      { model: User, as: 'creator', attributes: ['id', 'username'] },
    ],
  });
  if (!room) throw new NotFoundError('Room not found');
  const memberCount = await RoomMember.count({
    where: { room_id: roomId, left_at: null },
  });

  const roomData = { ...room.toJSON(), member_count: memberCount };

  // Only include invite_code for active members of private rooms
  if (room.is_private) {
    if (userId) {
      const member = await findActiveMember(roomId, userId);
      if (!member) delete roomData.invite_code;
    } else {
      delete roomData.invite_code;
    }
  } else {
    delete roomData.invite_code;
  }

  return roomData;
}

export async function deleteRoom(roomId, userId) {
  const room = await Room.findByPk(roomId);
  if (!room) throw new NotFoundError('Room not found');
  const member = await findActiveMember(roomId, userId);
  if (!member || member.role !== 'owner') {
    throw new ForbiddenError('Only the room owner can delete this room');
  }
  await Message.destroy({ where: { room_id: roomId } });
  await RoomBan.destroy({ where: { room_id: roomId } });
  await RoomMember.destroy({ where: { room_id: roomId } });
  await room.destroy();
}

// ─── join / leave ───

async function _joinRoomInternal(room, userId) {
  const roomId = room.id;
  const banned = await RoomBan.findOne({ where: { room_id: roomId, user_id: userId } });
  if (banned) throw new ForbiddenError('你已被该房间拉黑，无法加入');

  const existing = await findActiveMember(roomId, userId);
  if (existing) return existing;

  const leftMember = await RoomMember.findOne({
    where: { room_id: roomId, user_id: userId, left_at: { [Op.ne]: null } },
  });
  if (leftMember) {
    leftMember.left_at = null;
    leftMember.joined_at = new Date();
    leftMember.role = 'member';
    leftMember.is_muted = false;
    await leftMember.save();
    return leftMember;
  }

  return await RoomMember.create({ room_id: roomId, user_id: userId, role: 'member' });
}

export async function joinRoom(roomId, userId) {
  const room = await Room.findByPk(roomId);
  if (!room) throw new NotFoundError('Room not found');

  // Block direct join to private rooms unless already a member or previously left
  if (room.is_private) {
    const activeMember = await findActiveMember(roomId, userId);
    if (activeMember) return activeMember;
    const leftMember = await RoomMember.findOne({
      where: { room_id: roomId, user_id: userId, left_at: { [Op.ne]: null } },
    });
    if (!leftMember) {
      throw new ForbiddenError('私密房间需要邀请码才能加入');
    }
  }

  return _joinRoomInternal(room, userId);
}

export async function joinByInviteCode(inviteCode, userId) {
  const room = await Room.findOne({
    where: { invite_code: inviteCode.toUpperCase() },
  });
  if (!room) throw new NotFoundError('邀请码无效');

  const member = await _joinRoomInternal(room, userId);
  return { room, member };
}

export async function regenerateInviteCode(roomId, userId) {
  const room = await Room.findByPk(roomId);
  if (!room) throw new NotFoundError('Room not found');
  if (!room.is_private) throw new ForbiddenError('公开房间没有邀请码');

  const member = await findActiveMember(roomId, userId);
  if (!member || member.role !== 'owner') {
    throw new ForbiddenError('只有房主可以重新生成邀请码');
  }

  let lastError;
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      room.invite_code = generateInviteCode();
      await room.save();
      return room;
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError' && err.errors[0]?.path === 'invite_code') {
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export async function leaveRoom(roomId, userId) {
  const member = await findActiveMember(roomId, userId);
  if (!member) throw new NotFoundError('Not a member of this room');
  if (member.role === 'owner') throw new ForbiddenError('房主不能离开房间，请先转让房主');
  member.left_at = new Date();
  await member.save();
  return member;
}

// ─── members ───

export async function getMembers(roomId, { page = 1, limit = 50 }) {
  const room = await Room.findByPk(roomId);
  if (!room) throw new NotFoundError('Room not found');

  const offset = (page - 1) * limit;
  const { count, rows } = await RoomMember.findAndCountAll({
    where: { room_id: roomId, left_at: null },
    include: [{ model: User, attributes: ['id', 'username', 'avatar_url', 'is_online'] }],
    order: [
      [Sequelize.literal("FIELD(role, 'owner', 'admin', 'member')")],
      ['joined_at', 'ASC'],
    ],
    limit,
    offset,
  });
  return { members: rows, total: count, page, totalPages: Math.ceil(count / limit) };
}

export async function isMember(roomId, userId) {
  const member = await findActiveMember(roomId, userId);
  return !!member;
}

export async function getMemberRole(roomId, userId) {
  const member = await findActiveMember(roomId, userId);
  return member;
}

// ─── role management ───

export async function setRole(roomId, operatorId, targetUserId, newRole) {
  if (newRole === 'owner') throw new ForbiddenError('不能通过此接口设置房主');

  const operator = await findActiveMember(roomId, operatorId);
  if (!operator) throw new ForbiddenError('权限不足');

  const target = await findActiveMember(roomId, targetUserId);
  if (!target) throw new NotFoundError('目标用户不是房间成员');

  if (operator.role === 'owner') {
    // owner can set anyone to admin or member (except themselves)
    if (target.user_id === operatorId) throw new ForbiddenError('不能修改自己的角色');
  } else if (operator.role === 'admin') {
    // admin can only promote member→admin or demote member (cannot touch owner or other admin)
    if (target.role === 'owner') throw new ForbiddenError('不能修改房主的角色');
    if (target.role === 'admin') throw new ForbiddenError('管理员不能修改其他管理员的角色');
  } else {
    throw new ForbiddenError('权限不足');
  }

  target.role = newRole;
  await target.save();
  return target;
}

// ─── mute ───

export async function muteMember(roomId, operatorId, targetUserId) {
  const operator = await findActiveMember(roomId, operatorId);
  if (!operator || operator.role === 'member') throw new ForbiddenError('权限不足');

  const target = await findActiveMember(roomId, targetUserId);
  if (!target) throw new NotFoundError('目标用户不是房间成员');
  assertHigherRole(operator.role, target.role);

  target.is_muted = true;
  await target.save();
  return target;
}

export async function unmuteMember(roomId, operatorId, targetUserId) {
  const operator = await findActiveMember(roomId, operatorId);
  if (!operator || operator.role === 'member') throw new ForbiddenError('权限不足');

  const target = await findActiveMember(roomId, targetUserId);
  if (!target) throw new NotFoundError('目标用户不是房间成员');

  target.is_muted = false;
  await target.save();
  return target;
}

export async function isMuted(roomId, userId) {
  const member = await findActiveMember(roomId, userId);
  return member?.is_muted || false;
}

// ─── kick (with ban) ───

export async function kickMember(roomId, operatorId, targetUserId, reason) {
  const operator = await findActiveMember(roomId, operatorId);
  if (!operator || operator.role === 'member') throw new ForbiddenError('权限不足');

  const target = await findActiveMember(roomId, targetUserId);
  if (!target) throw new NotFoundError('目标用户不是房间成员');
  assertHigherRole(operator.role, target.role);

  target.left_at = new Date();
  await target.save();

  await RoomBan.findOrCreate({
    where: { room_id: roomId, user_id: targetUserId },
    defaults: { banned_by: operatorId, reason: reason || null },
  });

  return target;
}

// ─── ban management ───

export async function getBannedMembers(roomId, operatorId) {
  const operator = await findActiveMember(roomId, operatorId);
  if (!operator || operator.role !== 'owner') throw new ForbiddenError('只有房主可以查看黑名单');

  return RoomBan.findAll({
    where: { room_id: roomId },
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'avatar_url'] },
      { model: User, as: 'bannedByUser', attributes: ['id', 'username'] },
    ],
    order: [['created_at', 'DESC']],
  });
}

export async function unbanMember(roomId, operatorId, targetUserId) {
  const operator = await findActiveMember(roomId, operatorId);
  if (!operator || operator.role !== 'owner') throw new ForbiddenError('只有房主可以解除黑名单');

  const ban = await RoomBan.findOne({ where: { room_id: roomId, user_id: targetUserId } });
  if (!ban) throw new NotFoundError('该用户不在黑名单中');

  await ban.destroy();
}
