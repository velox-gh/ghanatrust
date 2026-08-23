import express from 'express';
import { getCategories, getServices, getServiceById, getLocations } from '../controllers/serviceController.js';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/services', getServices);
router.get('/services/:id', getServiceById);
router.get('/locations', getLocations);

export default router;
