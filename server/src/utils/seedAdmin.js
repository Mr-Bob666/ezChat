import sequelize from '../config/database.js';
import { Admin } from '../models/index.js';

const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD || 'admin123';

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const existing = await Admin.findOne({ where: { username } });
    if (existing) {
      console.log(`Admin "${username}" already exists, skipped.`);
    } else {
      await Admin.create({ username, password_hash: password });
      console.log(`Admin "${username}" created successfully.`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed admin:', err);
    process.exit(1);
  }
}

seedAdmin();
