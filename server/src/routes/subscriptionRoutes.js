import express from 'express';
import { initializeSubscription, verifySubscription, getMySubscriptions } from '../controllers/subscriptionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/initialize', protect, authorize('PROVIDER'), initializeSubscription);
router.get('/verify/:reference', protect, verifySubscription);
router.get('/me', protect, getMySubscriptions);

export default router;
