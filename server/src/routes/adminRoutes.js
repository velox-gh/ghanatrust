import express from 'express';
import {
  getVerifications,
  updateVerificationStatus,
  getDashboardStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllProviders,
  updateProvider,
  getAllBookings,
  adminCancelBooking,
  getAllPayments,
  refundPayment,
  getAllDisputes,
  getAuditLogs,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

// Stats
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Providers
router.get('/providers', getAllProviders);
router.put('/providers/:id', updateProvider);

// Bookings
router.get('/bookings', getAllBookings);
router.patch('/bookings/:id/cancel', adminCancelBooking);

// Payments
router.get('/payments', getAllPayments);
router.patch('/payments/:id/refund', refundPayment);

// Disputes
router.get('/disputes', getAllDisputes);

// Verifications
router.get('/verifications', getVerifications);
router.put('/verifications/:id/status', updateVerificationStatus);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

export default router;
