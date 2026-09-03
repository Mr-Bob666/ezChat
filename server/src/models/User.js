import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
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
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  avatar_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  is_online: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_disabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  last_seen: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      }
    },
  },
});

// Instance method: verify password
User.prototype.verifyPassword = async function (password) {
  return bcrypt.compare(password, this.password_hash);
};

// Instance method: to safe JSON (exclude password)
User.prototype.toSafeJSON = function () {
  const values = { ...this.get() };
  delete values.password_hash;
  return values;
};

export default User;
