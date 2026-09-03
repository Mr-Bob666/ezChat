import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { adminAuthMiddleware } from '../middleware/adminAuth.js';

const router = Router();

// Public
router.post('/login', adminController.login);

// Protected
router.use(adminAuthMiddleware);
router.get('/stats', adminController.getStats);
router.get('/users', adminController.listUsers);
router.put('/users/:id/disable', adminController.disableUser);
router.put('/users/:id/enable', adminController.enableUser);
router.put('/users/:id/reset-password', adminController.resetUserPassword);
router.get('/rooms', adminController.listRooms);
router.get('/rooms/:id/members', adminController.listRoomMembers);
router.delete('/rooms/:id', adminController.deleteRoom);
router.get('/messages', adminController.listMessages);
router.delete('/messages/:id', adminController.deleteMessage);
router.get('/recommend/:userId', adminController.recommendRooms);

export default router;
