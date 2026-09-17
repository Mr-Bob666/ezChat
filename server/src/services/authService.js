import jwt from 'jsonwebtoken';
import { User, DailyOnlineStat } from '../models/index.js';
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

function localDateString(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function recordOnlinePeak() {
  try {
    const count = await User.count({ where: { is_online: true } });
    const today = localDateString();
    const [stat] = await DailyOnlineStat.findOrCreate({
      where: { date: today },
      defaults: { peak_count: count },
    });
    if (count > stat.peak_count) {
      stat.peak_count = count;
      await stat.save();
    }
  } catch (err) {
    console.error('Failed to record online peak:', err);
  }
}

export async function setOnline(userId) {
  await User.update({ is_online: true, last_seen: new Date() }, { where: { id: userId } });
  await recordOnlinePeak();
}

export async function setOffline(userId) {
  await User.update({ is_online: false, last_seen: new Date() }, { where: { id: userId } });
  await recordOnlinePeak();
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
