import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  completeBooking,
  cancelBooking,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All booking routes require authentication
router.use(protect);

// List & Create
router.get('/', getMyBookings);
router.post('/', createBooking);

// Single booking detail
router.get('/:id', getBookingById);

// Status transitions
router.patch('/:id/status', updateBookingStatus);   // Provider: ACCEPT, IN_PROGRESS, SCHEDULED
router.patch('/:id/complete', completeBooking);      // Provider: mark COMPLETED + update stats
router.patch('/:id/cancel', cancelBooking);          // Customer/Admin: CANCEL

export default router;
