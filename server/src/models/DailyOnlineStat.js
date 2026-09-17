import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DailyOnlineStat = sequelize.define('DailyOnlineStat', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true,
  },
  peak_count: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'daily_online_stats',
});

export default DailyOnlineStat;
