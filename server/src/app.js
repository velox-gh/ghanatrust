import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config } from './config/environment.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import disputeRoutes from './routes/disputeRoutes.js';

const app = express();

// Middleware
const allowedOrigins = [
  /\.ngrok-free\.app$/,
  /\.ngrok\.io$/,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', serviceRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/disputes', disputeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'GhanaTrust API is running' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;