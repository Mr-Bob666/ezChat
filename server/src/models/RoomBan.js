import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RoomBan = sequelize.define('RoomBan', {
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
  banned_by: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
}, {
  tableName: 'room_bans',
  indexes: [
    {
      unique: true,
      fields: ['room_id', 'user_id'],
      name: 'room_bans_room_user_unique',
    },
  ],
});

export default RoomBan;
