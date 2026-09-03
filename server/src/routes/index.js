import { Router } from 'express';
import authRoutes from './auth.js';
import roomRoutes from './rooms.js';
import adminRoutes from './admin.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/admin', adminRoutes);

export default router;
