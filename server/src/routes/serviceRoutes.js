import express from 'express';
import { getCategories, getServices, getServiceById, getLocations, getNearestLocation } from '../controllers/serviceController.js';
import { cacheRoute } from '../middleware/cacheMiddleware.js';

const router = express.Router();

// Cache these public read-heavy endpoints for 5 minutes (300 seconds)
router.get('/categories', cacheRoute(300), getCategories);
router.get('/services', cacheRoute(300), getServices);
router.get('/services/:id', cacheRoute(300), getServiceById);
router.get('/locations', cacheRoute(3600), getLocations); // Locations rarely change, cache for 1 hour
// Uncached: the answer depends on the caller's coordinates, so a shared cache
// keyed on the path would hand one visitor's city to everyone else.
router.get('/locations/nearest', getNearestLocation);

export default router;
