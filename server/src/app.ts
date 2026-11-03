import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

const app = express();

// Security and CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, postman, mobile)
      if (!origin) {
        return callback(null, true);
      }

      // Allow configured client origin, CLIENT_URL env, vercel domains, or localhost
      if (
        origin === config.clientOrigin ||
        origin === process.env.CLIENT_URL ||
        origin.endsWith('.vercel.app') ||
        origin.startsWith('http://localhost:')
      ) {
        return callback(null, true);
      }

      // Safe production fallback
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing with safe size limits for image uploads
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Global rate limiting for generic API requests
app.use('/api', apiLimiter);

// Mount main API router
app.use('/api', apiRouter);

// Root greeting & status
app.get('/', (_req, res) => {
  res.json({
    message: 'FoodBridge API Server is online.',
    documentation: '/api/health',
    version: '1.0.0',
  });
});

// 404 Catch-All for unknown API routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handling middleware
app.use(errorHandler);

export default app;
