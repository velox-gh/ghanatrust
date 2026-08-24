import express from 'express';
import { getProviders, getProviderById, submitVerification, getMyVerifications } from '../controllers/providerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProviders);
router.post('/verifications', protect, authorize('PROVIDER'), submitVerification);
router.get('/verifications/me', protect, authorize('PROVIDER'), getMyVerifications);
router.get('/:id', getProviderById);

export default router;
