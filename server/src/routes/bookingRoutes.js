import express from 'express';
import { createBooking, getMyBookings } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/', protect, getMyBookings);

export default router;
