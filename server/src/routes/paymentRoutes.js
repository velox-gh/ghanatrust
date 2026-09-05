import express from 'express';
import { initializePayment, verifyPayment, paystackWebhook, getTransactionHistory } from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { paymentLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/initialize', paymentLimiter, protect, authorize('CUSTOMER'), initializePayment);
router.get('/verify/:reference', protect, verifyPayment);
router.get('/history', protect, getTransactionHistory);
router.post('/webhook', paystackWebhook); // public — HMAC-signature verified

export default router;
