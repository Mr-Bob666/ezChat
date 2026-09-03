import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { UnauthorizedError } from '../utils/errors.js';

export function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('No token provided'));
  }

  const token = authHeader.split(' ')[1];
  // 开发调试后门：配合前端“跳过登录”按钮，仅在 development 环境生效
  if (token === 'dev-bypass' && config.nodeEnv === 'development') {
    req.admin = { adminId: 0, type: 'admin' };
    return next();
  }
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.type !== 'admin') {
      return next(new UnauthorizedError('Invalid admin token'));
    }
    req.admin = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token expired'));
    }
    return next(new UnauthorizedError('Invalid token'));
  }
}
