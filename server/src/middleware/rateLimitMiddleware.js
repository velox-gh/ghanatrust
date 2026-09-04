import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

/**
 * Shared limiter options. `trust proxy` is set in server.js so the real client
 * IP is used behind ngrok / a reverse proxy rather than the proxy's own.
 */
const base = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please wait a moment and try again.',
  },
};

/** Broad ceiling for the whole API — stops scraping and runaway clients. */
export const apiLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: 600,
});

/**
 * Credential endpoints. Tight, because these are the brute-force targets, and
 * keyed on IP + submitted email so one attacker can't lock out a shared NAT.
 * Successful logins don't count against the budget.
 */
export const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  // ipKeyGenerator normalises IPv6 to its /64 prefix; using req.ip raw would let
  // a v6 client get a fresh budget from every address in its subnet.
  keyGenerator: (req) => `${ipKeyGenerator(req.ip)}:${(req.body?.email || '').toLowerCase()}`,
  message: {
    success: false,
    message: 'Too many sign-in attempts. Please try again in 15 minutes.',
  },
});

/** Payment initiation — each call can create a Paystack transaction. */
export const paymentLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  max: 20,
});

/**
 * Guest booking. Unauthenticated and it writes a User row, so it needs a
 * tighter budget than ordinary reads — enough for a person who mistypes a few
 * times, not enough to seed the users table.
 */
export const guestBookingLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  max: 8,
  message: {
    success: false,
    message: 'Too many booking attempts from this device. Please try again later.',
  },
});
