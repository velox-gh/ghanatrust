import express from 'express';
import {
  createDispute,
  uploadEvidence,
  getDisputes,
  getDisputeById,
  investigateDispute,
  resolveDispute
} from '../controllers/disputeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All dispute routes require authentication
router.use(protect);

// General routes (Customer / Provider / Admin)
router.post('/', createDispute);
router.get('/', getDisputes);
router.get('/:id', getDisputeById);
router.post('/:id/evidence', uploadEvidence);

// Admin only routes
router.patch('/:id/investigate', authorize('ADMIN'), investigateDispute);
router.patch('/:id/resolve', authorize('ADMIN'), resolveDispute);

export default router;
