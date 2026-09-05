import express from 'express';
import passport from 'passport';
import {
  register, login, getMe, generateToken,
  verifyEmail, resendVerification,
  forgotPassword, resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Email verification + password reset
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', protect, resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Google OAuth redirect flow
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${CLIENT_URL}/login?error=google`,
  }),
  (req, res) => {
    // Hand the app JWT to the SPA via the URL fragment (never sent to servers/proxies)
    const token = generateToken(req.user.id);
    res.redirect(`${CLIENT_URL}/auth/success#token=${token}`);
  }
);

export default router;
