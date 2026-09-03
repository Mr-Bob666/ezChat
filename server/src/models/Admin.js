import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'admins',
  hooks: {
    beforeCreate: async (admin) => {
      if (admin.password_hash) {
        const salt = await bcrypt.genSalt(10);
        admin.password_hash = await bcrypt.hash(admin.password_hash, salt);
      }
    },
    beforeUpdate: async (admin) => {
      if (admin.changed('password_hash')) {
        const salt = await bcrypt.genSalt(10);
        admin.password_hash = await bcrypt.hash(admin.password_hash, salt);
      }
    },
  },
});

// Instance method: verify password
Admin.prototype.verifyPassword = async function (password) {
  return bcrypt.compare(password, this.password_hash);
};

export default Admin;
