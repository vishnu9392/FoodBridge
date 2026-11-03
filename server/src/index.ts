import app from './app';
import { startServer } from './server';

// Start server on load
startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});

export default app;
export { app, startServer };
