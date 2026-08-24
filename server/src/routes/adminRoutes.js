import express from 'express';
import { getVerifications, updateVerificationStatus } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/verifications', getVerifications);
router.put('/verifications/:id/status', updateVerificationStatus);

export default router;
