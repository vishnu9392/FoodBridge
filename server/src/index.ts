import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

const app = express();

// Security and CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, postman) or configured client origin
      if (!origin || origin === config.clientOrigin || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Dev-friendly fallback
      }
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

// Start server and initialize database connection
async function startServer() {
  console.log('🔄 Initializing FoodBridge backend services...');

  // Connect to MongoDB before starting Express server
  const dbConnected = await connectDatabase();

  const server = app.listen(config.port, () => {
    console.log(`🚀 FoodBridge Server listening on http://localhost:${config.port}`);
    console.log(`🌐 Allowed Client Origin: ${config.clientOrigin}`);
    console.log(`🩺 Health endpoint: http://localhost:${config.port}/api/health`);
    if (!dbConnected) {
      console.warn('⚠️ [Degraded Mode]: Express server is running, but MongoDB is disconnected.');
      console.warn('⚠️ Database operations will return 503 until connection is restored.');
    }
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      console.log('Server process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});

export default app;
