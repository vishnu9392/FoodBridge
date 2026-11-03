import { Request, Response, NextFunction } from 'express';
import { Donation } from '../models/Donation';
import {
  calculateExpiryStatus,
  getTimeRemaining,
  estimateShelfLife,
  FOOD_SAFETY_DISCLAIMER,
} from '../services/expiryService';

export async function getExpiryAnalytics(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const [freshCount, expiringSoonCount, expiredCount, expiringSoonItems] =
      await Promise.all([
        Donation.countDocuments({ status: 'available', expiryDate: { $gt: in24h } }),
        Donation.countDocuments({
          status: 'available',
          expiryDate: { $gt: now, $lte: in24h },
        }),
        Donation.countDocuments({ status: 'available', expiryDate: { $lte: now } }),
        Donation.find({
          status: 'available',
          expiryDate: { $gt: now, $lte: in24h },
        })
          .populate('donor', 'name organization phone address')
          .sort({ expiryDate: 1 })
          .limit(10),
      ]);

    const formattedItems = expiringSoonItems.map((item) => ({
      ...item.toJSON(),
      expiryStatus: 'expiring_soon' as const,
      timeRemaining: getTimeRemaining(item.expiryDate, now),
    }));

    res.status(200).json({
      success: true,
      counts: {
        fresh: freshCount,
        expiringSoon: expiringSoonCount,
        expired: expiredCount,
        totalActive: freshCount + expiringSoonCount,
      },
      expiringSoonListings: formattedItems,
      disclaimer: FOOD_SAFETY_DISCLAIMER,
    });
  } catch (err) {
    next(err);
  }
}

export function calculateCustomEstimate(req: Request, res: Response): void {
  const { category, preparationDate, storageCondition } = req.body;

  if (!category) {
    res.status(400).json({
      success: false,
      message: 'Category is required for shelf-life estimation.',
    });
    return;
  }

  const validConditions = ['room_temperature', 'refrigerated', 'frozen'];
  const condition = validConditions.includes(storageCondition)
    ? storageCondition
    : 'refrigerated';

  const result = estimateShelfLife({
    category,
    preparationDate: preparationDate || new Date().toISOString(),
    storageCondition: condition,
  });

  res.status(200).json({
    success: true,
    result,
  });
}
