import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB, getDbStatus } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import songRoutes from './routes/songRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

// Initialize express app
const app = express();

// Establish database connection
await connectDB();

// Global Middlewares
app.use(cors({
  origin: '*', // Allow all origins for local development, can be configured for specific domains
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Support larger body limit for profile avatars
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiter to prevent brute force or abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per 15 minutes
  message: { message: 'Too many requests from this IP, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// Server Status API
app.get('/api/status', (req, res) => {
  const dbStatus = getDbStatus();
  res.json({
    status: 'online',
    timestamp: new Date(),
    database: dbStatus
  });
});

// Map Router Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);

// Fallback for undmapped endpoints
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

// Launch server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`RapVault Backend Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`Status URL: http://localhost:${PORT}/api/status`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`======================================================\n`);
});
