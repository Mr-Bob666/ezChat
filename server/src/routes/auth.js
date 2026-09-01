import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { validate, schemas } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = Router();

router.post('/send-code', validate(schemas.sendCode), authController.sendCode);
router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);
router.post('/reset-password', validate(schemas.resetPassword), authController.resetPassword);
router.get('/me', authMiddleware, authController.getMe);
router.post('/avatar', authMiddleware, uploadAvatar.single('avatar'), authController.uploadAvatar);

export default router;
