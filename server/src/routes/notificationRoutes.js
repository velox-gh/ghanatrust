import express from 'express';
import { listNotifications, markRead, markAllRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', listNotifications);
router.patch('/:id/read', markRead);
router.post('/read-all', markAllRead);

export default router;
