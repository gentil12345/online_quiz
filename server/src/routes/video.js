import express from 'express';
import {
  createRoom,
  getRooms,
  getRoomById,
  joinRoom,
  endSession,
  leaveRoom,
} from '../controllers/videoController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/rooms', protect, createRoom);
router.get('/rooms', protect, getRooms);
router.get('/rooms/:roomId', protect, getRoomById);
router.post('/rooms/:roomId/join', protect, joinRoom);
router.post('/rooms/:roomId/end', protect, endSession);
router.post('/rooms/:roomId/leave', protect, leaveRoom);

export default router;
