import express from 'express';
import { createPayment, getTransactionHistory } from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('CUSTOMER'), createPayment);
router.get('/history', protect, getTransactionHistory);

export default router;
