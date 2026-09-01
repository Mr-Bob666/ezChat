import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  is_private: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_by: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  invite_code: {
    type: DataTypes.STRING(8),
    allowNull: true,
  },
}, {
  tableName: 'rooms',
  indexes: [
    {
      fields: ['is_private', 'created_at'],
      name: 'rooms_private_created',
    },
    {
      unique: true,
      fields: ['invite_code'],
      name: 'rooms_invite_code_unique',
    },
  ],
});

export default Room;
