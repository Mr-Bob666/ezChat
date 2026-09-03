import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import config from '../config/index.js';
import { UnauthorizedError, ForbiddenError, NotFoundError, ValidationError } from '../utils/errors.js';
import { verifyCode, consumeCode } from './verificationService.js';

function generateToken(userId) {
  return jwt.sign({ userId }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

export async function register({ username, email, password, code }) {
  if (!verifyCode(email, code, 'register')) {
    throw new ValidationError('验证码错误或已过期');
  }
  const user = await User.create({ username, email, password_hash: password });
  consumeCode(email);
  const token = generateToken(user.id);
  return { user: user.toSafeJSON(), token };
}

export async function resetPassword({ email, code, newPassword }) {
  if (!verifyCode(email, code, 'reset')) {
    throw new ValidationError('验证码错误或已过期');
  }
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundError('该邮箱未注册');
  }
  user.password_hash = newPassword;
  await user.save();
  consumeCode(email);
  return { message: '密码重置成功' };
}

export async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }
  const isMatch = await user.verifyPassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }
  if (user.is_disabled) {
    throw new ForbiddenError('账号已被禁用，请联系管理员');
  }
  const token = generateToken(user.id);
  return { user: user.toSafeJSON(), token };
}

export async function findUserById(id) {
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password_hash'] },
  });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
}

export async function setOnline(userId) {
  await User.update({ is_online: true, last_seen: new Date() }, { where: { id: userId } });
}

export async function setOffline(userId) {
  await User.update({ is_online: false, last_seen: new Date() }, { where: { id: userId } });
}

export async function updateAvatar(userId, avatarUrl) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  user.avatar_url = avatarUrl;
  await user.save();
  return user.toSafeJSON();
}
