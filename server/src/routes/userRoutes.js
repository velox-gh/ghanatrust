import express from 'express';
import {
  listSavedProviders,
  saveProvider,
  unsaveProvider,
  listSavedProviderIds,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/saved-providers/ids', listSavedProviderIds);
router.get('/saved-providers', listSavedProviders);
router.post('/saved-providers/:providerId', saveProvider);
router.delete('/saved-providers/:providerId', unsaveProvider);

export default router;
