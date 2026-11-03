import { Request, Response } from 'express';
import { getDatabaseStatus } from '../config/database';

export function getHealthStatus(_req: Request, res: Response): void {
  const dbStatus = getDatabaseStatus();

  const isHealthy = dbStatus.connected;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    server: {
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
    },
    database: {
      connected: dbStatus.connected,
      state: dbStatus.readyState === 1 ? 'connected' : 'disconnected',
      databaseName: dbStatus.databaseName || null,
      setupRequired: !dbStatus.connected,
      message: dbStatus.connected
        ? 'MongoDB Atlas is connected and operational.'
        : dbStatus.error ||
          'MongoDB Atlas is not connected. Configure MONGODB_URI in server/.env with your Atlas connection string.',
    },
  });
}
