import { Request, Response } from 'express';
import { getDatabaseStatus } from '../config/database';
import { seedDemoData } from '../utils/seed';

/**
 * Controller to seed demo data into MongoDB Atlas via POST /api/seed
 */
export async function runDatabaseSeed(_req: Request, res: Response): Promise<void> {
  const dbStatus = getDatabaseStatus();

  if (!dbStatus.connected) {
    res.status(503).json({
      success: false,
      message: 'MongoDB Atlas is not connected yet. Check MONGODB_URI in server/.env.',
    });
    return;
  }

  try {
    const seeded = await seedDemoData();
    if (!seeded) {
      res.status(500).json({
        success: false,
        message: 'Database seeding failed. See server logs for details.',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Demo database seeded successfully with realistic community food donations.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown seeding error';
    res.status(500).json({
      success: false,
      message: `Failed to seed database: ${errorMsg}`,
    });
  }
}
