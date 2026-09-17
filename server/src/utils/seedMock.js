/**
 * Mock 数据脚本：建库 → 同步表结构 → 插入种子数据
 * 用法：cd server && npm run seed:mock
 * 幂等：若已存在 mock 用户（mock1@example.com）则跳过。
 */
import mysql from 'mysql2/promise';
import sequelize from '../config/database.js';
import config from '../config/index.js';
import { Admin, User, Room, RoomMember, RoomBan, Message } from '../models/index.js';

async function ensureDatabase() {
  // sqlite 无需提前建库，sequelize 会自动创建存储文件
  if (config.db.dialect === 'sqlite') return;
  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
  });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.end();
  console.log(`Database "${config.db.name}" ready`);
}

const USERNAMES = ['小明', '小红', '阿伟', '莉莉', '老王', '张三', '李四', '晓芳', '大壮', '甜甜', 'Kevin', 'Momo'];

const ROOMS = [
  { name: '技术交流', description: '前后端技术讨论，禁止灌水', isPrivate: false },
  { name: '游戏开黑', description: 'LOL / 王者 / 原神组队', isPrivate: false },
  { name: '电影分享', description: '最近看了什么好片', isPrivate: false },
  { name: '深夜食堂', description: '放毒专用，深夜勿入', isPrivate: false },
  { name: '项目内部群', description: 'ezChat 项目组内部讨论', isPrivate: true },
];

const MESSAGE_TEMPLATES = [
  '大家好，新人报到',
  '有人在线吗？',
  '这个 bug 我调了一下午了',
  '今晚开黑吗？',
  '推荐一部最近看的电影',
  '刚点的烧烤到了，深夜放毒',
  '这个需求明天能上线吗',
  '有人懂 WebSocket 心跳怎么做吗',
  '周末有一起爬山的吗',
  '笑死，刚才发生产事故了',
  '这个版本更新了什么功能',
  '我先下了，明天见',
  '求一个接口文档地址',
  '这段代码谁写的，出来挨打',
  '今天天气不错',
];

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n, hourJitter = true) {
  const d = new Date(Date.now() - n * 24 * 3600 * 1000);
  if (hourJitter) {
    d.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60), 0, 0);
  }
  return d;
}

/**
 * Sequelize create() 会覆盖传入的 createdAt，这里用原生 SQL 把时间戳打散到过去若干天。
 * 每次运行都会执行（包括重复运行时），便于已有 mock 数据修复时间分布。
 */
async function spreadTimestamps() {
  const messages = await Message.findAll({ attributes: ['id'], raw: true });
  for (const m of messages) {
    await sequelize.query('UPDATE messages SET created_at = ? WHERE id = ?', {
      replacements: [daysAgo(Math.floor(Math.random() * 14)), m.id],
    });
  }
  const users = await User.findAll({ attributes: ['id'], raw: true });
  for (const u of users) {
    await sequelize.query('UPDATE users SET created_at = ? WHERE id = ?', {
      replacements: [daysAgo(10 + Math.floor(Math.random() * 30)), u.id],
    });
  }
  const rooms = await Room.findAll({ attributes: ['id'], raw: true });
  for (const r of rooms) {
    await sequelize.query('UPDATE rooms SET created_at = ? WHERE id = ?', {
      replacements: [daysAgo(15 + Math.floor(Math.random() * 20)), r.id],
    });
  }
  console.log('Timestamps spread over past days');
}

async function seed() {
  // 1. 管理员
  const [admin, adminCreated] = await Admin.findOrCreate({
    where: { username: process.env.ADMIN_USERNAME || 'admin' },
    defaults: { password_hash: process.env.ADMIN_PASSWORD || 'admin123' },
  });
  console.log(adminCreated ? `Admin "${admin.username}" created` : 'Admin already exists');

  // 2. 用户
  if (await User.findOne({ where: { email: 'mock1@example.com' } })) {
    console.log('Mock data already exists, skipped.');
    return;
  }

  const users = [];
  for (let i = 0; i < USERNAMES.length; i++) {
    const user = await User.create({
      username: USERNAMES[i],
      email: `mock${i + 1}@example.com`,
      password_hash: '123456',
      is_online: Math.random() > 0.6,
      last_seen: daysAgo(Math.floor(Math.random() * 3)),
      createdAt: daysAgo(30 - i * 2),
    });
    users.push(user);
  }
  console.log(`${users.length} users created (password: 123456)`);

  // 3. 房间
  const rooms = [];
  for (let i = 0; i < ROOMS.length; i++) {
    const r = ROOMS[i];
    const room = await Room.create({
      name: r.name,
      description: r.description,
      is_private: r.isPrivate,
      created_by: users[i].id,
      invite_code: r.isPrivate ? `INV${String(1000 + i)}` : null,
      createdAt: daysAgo(25 - i * 3),
    });
    rooms.push(room);
  }
  console.log(`${rooms.length} rooms created`);

  // 4. 房间成员（刻意制造跨房间重合，让推荐算法有数据可算）
  const memberships = [
    // [房间索引, 用户索引数组, 房主]
    [0, [0, 1, 2, 4, 5, 6, 10]],
    [1, [0, 2, 3, 6, 7, 8]],
    [2, [1, 4, 5, 9, 10, 11]],
    [3, [2, 3, 7, 8, 9]],
    [4, [0, 1, 4, 10]],
  ];
  let memberCount = 0;
  for (const [roomIdx, userIdxs] of memberships) {
    const room = rooms[roomIdx];
    for (const uIdx of userIdxs) {
      const role = users[uIdx].id === room.created_by ? 'owner' : uIdx === userIdxs[1] ? 'admin' : 'member';
      await RoomMember.create({
        room_id: room.id,
        user_id: users[uIdx].id,
        role,
        joined_at: room.created_at,
      });
      memberCount++;
    }
  }
  console.log(`${memberCount} memberships created`);

  // 5. 一条封禁记录
  await RoomBan.create({
    room_id: rooms[1].id,
    user_id: users[11].id,
    banned_by: users[0].id,
    reason: '恶意刷屏',
  });
  console.log('1 room ban created');

  // 6. 消息（时间分布在最近 14 天）
  let messageCount = 0;
  for (const [roomIdx, userIdxs] of memberships) {
    const room = rooms[roomIdx];
    for (let i = 0; i < 25; i++) {
      const uIdx = randomPick(userIdxs);
      await Message.create({
        room_id: room.id,
        user_id: users[uIdx].id,
        content: randomPick(MESSAGE_TEMPLATES),
        type: 'text',
        createdAt: daysAgo(Math.floor(Math.random() * 14)),
      });
      messageCount++;
    }
  }
  // 其中一条撤回，便于消息管理页展示
  const anyMsg = await Message.findOne({ order: [['id', 'DESC']] });
  if (anyMsg) await anyMsg.update({ is_recalled: true });
  console.log(`${messageCount} messages created`);
}

async function main() {
  try {
    await ensureDatabase();
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Schema synced');
    await seed();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('seed:mock failed:', err.message);
    process.exit(1);
  }
}

main();
