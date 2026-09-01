import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    name: process.env.DB_NAME || 'ezchat',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    forceSync: process.env.DB_FORCE_SYNC === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  mail: {
    host: process.env.MAIL_HOST || 'smtp.163.com',
    port: parseInt(process.env.MAIL_PORT || '465'),
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    from: process.env.MAIL_FROM || process.env.MAIL_USER || '',
  },
  clientUrl: process.env.CLIENT_URL || 'https://localhost:5173',
};
