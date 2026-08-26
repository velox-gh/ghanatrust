import express from 'express';
import { createReview, getProviderReviews } from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('CUSTOMER'), createReview);
router.get('/provider/:providerId', getProviderReviews);

export default router;
