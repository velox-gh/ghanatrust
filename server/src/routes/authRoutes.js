import express from 'express';
import passport, { googleEnabled } from '../config/passport.js';
import { register, login, getMe, generateToken } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);

// Google OAuth redirect flow. Only mounted when the strategy is configured —
// authenticating against an unregistered strategy throws at request time.
if (googleEnabled) {
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
}

// Lets the client hide the Google button when the server cannot serve it.
router.get('/providers/config', (req, res) => {
  res.json({ success: true, google: googleEnabled });
});

export default router;
