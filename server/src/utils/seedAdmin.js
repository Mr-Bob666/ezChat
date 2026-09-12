import sequelize from '../config/database.js';
import { Admin } from '../models/index.js';

// 平台管理员账号（密码均为 admin）
const admins = [
  { username: 'wj', password: 'admin' },
  { username: 'bob', password: 'admin' },
];

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    for (const { username, password } of admins) {
      const existing = await Admin.findOne({ where: { username } });
      if (existing) {
        console.log(`Admin "${username}" already exists, skipped.`);
      } else {
        await Admin.create({ username, password_hash: password });
        console.log(`Admin "${username}" created successfully.`);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed admin:', err);
    process.exit(1);
  }
}

seedAdmin();
