import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize } from 'sequelize';
import config from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const common = {
  logging: config.nodeEnv === 'development' ? console.log : false,
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

const sequelize = config.db.dialect === 'sqlite'
  ? new Sequelize({
      ...common,
      dialect: 'sqlite',
      storage: path.resolve(__dirname, '../../', config.db.storage),
    })
  : new Sequelize(config.db.name, config.db.user, config.db.password, {
      ...common,
      timezone: '+08:00',
      host: config.db.host,
      port: config.db.port,
      dialect: 'mysql',
    });

export default sequelize;
