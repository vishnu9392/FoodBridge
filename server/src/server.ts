import app from './app';
import { config } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';

/**
 * Initializes database connection and starts listening on configured port.
 */
export async function startServer() {
  console.log('🔄 Initializing FoodBridge backend services...');

  // Connect to MongoDB before accepting incoming HTTP requests
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

  return server;
}

// Start server if executed directly
if (require.main === module) {
  startServer().catch((err) => {
    console.error('Fatal startup error:', err);
    process.exit(1);
  });
}
