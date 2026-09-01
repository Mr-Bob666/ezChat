import { Router } from 'express';
import * as roomController from '../controllers/roomController.js';
import * as messageController from '../controllers/messageController.js';
import { validate, schemas } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';
import { uploadMessageImage } from '../middleware/upload.js';

const router = Router();

router.use(authMiddleware);

router.get('/', roomController.listRooms);
router.post('/', validate(schemas.createRoom), roomController.createRoom);
router.get('/joined', roomController.listJoinedRooms);
router.post('/join-by-code', validate(schemas.joinByCode), roomController.joinByInviteCode);
router.get('/:roomId', roomController.getRoom);
router.delete('/:roomId', roomController.deleteRoom);
router.post('/:roomId/join', roomController.joinRoom);
router.post('/:roomId/leave', roomController.leaveRoom);
router.post('/:roomId/regenerate-code', roomController.regenerateInviteCode);
router.get('/:roomId/members', roomController.getMembers);

// Role management
router.put('/:roomId/members/:userId/role', roomController.setRole);

// Mute
router.post('/:roomId/members/:userId/mute', roomController.muteMember);
router.post('/:roomId/members/:userId/unmute', roomController.unmuteMember);

// Kick (with ban)
router.post('/:roomId/members/:userId/kick', roomController.kickMember);

// Ban management
router.get('/:roomId/bans', roomController.getBannedMembers);
router.delete('/:roomId/bans/:userId', roomController.unbanMember);

// Messages nested under rooms
router.get('/:roomId/messages', messageController.getMessages);
router.post('/:roomId/messages/upload', uploadMessageImage.single('image'), messageController.uploadImage);

export default router;
