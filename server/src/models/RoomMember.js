import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RoomMember = sequelize.define('RoomMember', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  room_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('owner', 'admin', 'member'),
    defaultValue: 'member',
  },
  is_muted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  joined_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  left_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'room_members',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['room_id', 'user_id', 'left_at'],
      name: 'room_members_room_user_left_unique',
    },
  ],
});

export default RoomMember;
