import { Request, Response, NextFunction } from 'express';
import { getDatabaseStatus } from '../config/database';

export function requireDatabase(req: Request, res: Response, next: NextFunction): void {
  const db = getDatabaseStatus();

  if (!db.connected) {
    res.status(503).json({
      success: false,
      message: 'Database is disconnected. Please ensure MongoDB Atlas is accessible and IP access list is configured.',
      databaseError: db.error ? db.error.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@') : 'Database connection not ready',
      retryable: true,
    });
    return;
  }

  next();
}
