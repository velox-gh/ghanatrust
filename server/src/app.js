import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config } from './config/environment.js';
import session from 'express-session';
import passport from './config/passport.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/rateLimitMiddleware.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import disputeRoutes from './routes/disputeRoutes.js';

const app = express();

// Security headers. crossOriginResourcePolicy is relaxed because the SPA is
// served from a different origin in development; CSP is left to the static
// host that serves the built client rather than set on the JSON API.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Middleware
const allowedOrigins = [
  /\.ngrok-free\.app$/,
  /\.ngrok\.io$/,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  // Private LAN ranges — phone testing on the same Wi-Fi (vite serves on the machine's LAN IP)
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d{4,5}$/,
  /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{4,5}$/,
  /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}:\d{4,5}$/,
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some((o) =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
  },
  credentials: true,
  exposedHeaders: ['ngrok-skip-browser-warning'],
}));

// Bypass ngrok's browser warning interstitial page for all API responses
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

app.use(compression());
app.use(cookieParser());
// Paystack webhook needs the RAW body for HMAC signature verification — must run BEFORE express.json consumes it
app.use('/api/payments/webhook', express.raw({ type: '*/*' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session is used ONLY for the Google OAuth handshake state — login itself is JWT
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: config.isProduction },
}));
app.use(passport.initialize());

// Broad ceiling across the API; auth and payment routes add tighter limits.
// Paystack's webhook is exempt — it is authenticated by HMAC signature, and
// throttling a retry storm from Paystack would drop real payment events.
app.use('/api', (req, res, next) => {
  if (req.path === '/payments/webhook') return next();
  return apiLimiter(req, res, next);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', serviceRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/disputes', disputeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'GhanaTrust API is running' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;