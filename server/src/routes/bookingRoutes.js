import express from 'express';
import {
  createBooking,
  createGuestBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  agreePrice,
  completeBooking,
  cancelBooking,
  getMessages,
  sendMessage,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { guestBookingLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Guest booking is the one public route here — it creates a customer record
// from unauthenticated input, so it is rate limited before anything else.
router.post('/guest', guestBookingLimiter, createGuestBooking);

// Everything below requires authentication
router.use(protect);

// List & Create
router.get('/', getMyBookings);
router.post('/', createBooking);

// Single booking detail
router.get('/:id', getBookingById);

// Status transitions
router.patch('/:id/status', updateBookingStatus);   // Provider: ACCEPT, IN_PROGRESS, SCHEDULED
router.patch('/:id/agree-price', agreePrice);        // Customer: AGREE_PRICE
router.patch('/:id/complete', completeBooking);      // Provider: mark COMPLETED + update stats
router.patch('/:id/cancel', cancelBooking);          // Customer/Admin: CANCEL

// Messages
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);

export default router;
