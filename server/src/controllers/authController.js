import * as authService from '../services/authService.js';
import * as verificationService from '../services/verificationService.js';
import * as mailService from '../services/mailService.js';
import { User } from '../models/index.js';
import { ValidationError } from '../utils/errors.js';

export async function sendCode(req, res, next) {
  try {
    const { email, type } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (type === 'register' && existing) {
      throw new ValidationError('该邮箱已被注册');
    }
    if (type === 'reset' && !existing) {
      throw new ValidationError('该邮箱未注册');
    }
    const cooldown = verificationService.remainingCooldown(email);
    if (cooldown > 0) {
      throw new ValidationError(`请 ${cooldown} 秒后再试`);
    }
    const code = verificationService.generateCode();
    verificationService.saveCode(email, code, type);
    await mailService.sendVerificationCode(email, code, type);
    res.json({ message: '验证码已发送', cooldown: 60 });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const result = await authService.resetPassword(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await authService.findUserById(req.user.userId);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { code: 'NO_FILE', message: '请选择一张图片' } });
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await authService.updateAvatar(req.user.userId, avatarUrl);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
