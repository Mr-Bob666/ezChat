import { Op } from 'sequelize';
import crypto from 'crypto';
import { Room, RoomMember, RoomBan, Message } from '../models/index.js';

function generateInviteCode() {
  return crypto.randomBytes(5).toString('hex').substring(0, 8).toUpperCase();
}

const LEGACY_ROOMS = ['大厅', '闲聊', '技术交流'];

export async function seedRooms() {
  for (const name of LEGACY_ROOMS) {
    const room = await Room.findOne({ where: { name, created_by: null } });
    if (room) {
      await Message.destroy({ where: { room_id: room.id } });
      await RoomBan.destroy({ where: { room_id: room.id } });
      await RoomMember.destroy({ where: { room_id: room.id } });
      await room.destroy();
      console.log(`  Removed legacy room: ${name}`);
    }
  }
}

/**
 * Fix legacy data: ensure every room's creator has the 'owner' role.
 * Safe to run repeatedly — only updates rows that still have role='member'.
 */
export async function migrateOwnerRoles() {
  const rooms = await Room.findAll({
    where: { created_by: { [Op.ne]: null } },
    attributes: ['id', 'created_by'],
  });

  let fixed = 0;
  for (const room of rooms) {
    const [count] = await RoomMember.update(
      { role: 'owner' },
      {
        where: {
          room_id: room.id,
          user_id: room.created_by,
          left_at: null,
          role: { [Op.ne]: 'owner' },
        },
      },
    );
    fixed += count;
  }

  if (fixed > 0) {
    console.log(`  Migrated ${fixed} room creator(s) to owner role`);
  }
}

/**
 * Fix legacy data: ensure every private room has an invite code.
 * Safe to run repeatedly — only updates rows where invite_code IS NULL.
 */
export async function migrateInviteCodes() {
  const rooms = await Room.findAll({
    where: { is_private: true, invite_code: { [Op.is]: null } },
    attributes: ['id'],
  });

  let fixed = 0;
  for (const room of rooms) {
    let code;
    let attempts = 0;
    while (attempts < 10) {
      code = generateInviteCode();
      const [count] = await Room.update(
        { invite_code: code },
        { where: { id: room.id, invite_code: { [Op.is]: null } } },
      );
      if (count > 0) break;
      attempts++;
    }
    fixed++;
  }

  if (fixed > 0) {
    console.log(`  Generated invite codes for ${fixed} private room(s)`);
  }
}
