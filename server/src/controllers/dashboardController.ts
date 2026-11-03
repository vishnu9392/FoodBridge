import { Request, Response, NextFunction } from 'express';
import { Donation } from '../models/Donation';
import { Pickup } from '../models/Pickup';
import { User } from '../models/User';
import { calculateExpiryStatus, getTimeRemaining } from '../services/expiryService';

export async function getDonorDashboardStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const donorId = req.user.id;
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const [
      totalDonations,
      activeDonations,
      completedPickups,
      pendingPickupRequests,
      recentDonations,
      expiringSoonDonations,
      incomingPickups,
    ] = await Promise.all([
      Donation.countDocuments({ donor: donorId }),
      Donation.countDocuments({ donor: donorId, status: 'available', expiryDate: { $gt: now } }),
      Pickup.countDocuments({ donor: donorId, status: 'completed' }),
      Pickup.countDocuments({ donor: donorId, status: 'pending' }),
      Donation.find({ donor: donorId }).sort({ createdAt: -1 }).limit(5),
      Donation.find({
        donor: donorId,
        status: 'available',
        expiryDate: { $gt: now, $lte: in24h },
      }).sort({ expiryDate: 1 }),
      Pickup.find({ donor: donorId, status: 'pending' })
        .populate('donation')
        .populate('recipient', 'name email phone organization')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const formattedRecent = recentDonations.map((d) => ({
      ...d.toJSON(),
      expiryStatus: calculateExpiryStatus(d.expiryDate, now),
      timeRemaining: getTimeRemaining(d.expiryDate, now),
    }));

    const formattedExpiring = expiringSoonDonations.map((d) => ({
      ...d.toJSON(),
      expiryStatus: 'expiring_soon' as const,
      timeRemaining: getTimeRemaining(d.expiryDate, now),
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalDonations,
        activeDonations,
        completedPickups,
        pendingPickupRequests,
        expiringSoonCount: expiringSoonDonations.length,
      },
      recentDonations: formattedRecent,
      expiringSoonDonations: formattedExpiring,
      pendingRequests: incomingPickups,
    });
  } catch (err) {
    next(err);
  }
}

export async function getPlatformStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const now = new Date();

    const [
      totalDonationsCount,
      completedPickupsCount,
      activeListingsCount,
      totalDonorsCount,
      totalRecipientsCount,
      totalQtyAgg,
      completedQtyAgg,
    ] = await Promise.all([
      Donation.countDocuments(),
      Pickup.countDocuments({ status: 'completed' }),
      Donation.countDocuments({ status: 'available', expiryDate: { $gt: now } }),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'recipient' }),
      Donation.aggregate([
        { $group: { _id: null, totalQty: { $sum: '$quantity' } } },
      ]),
      Donation.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, totalQty: { $sum: '$quantity' } } },
      ]),
    ]);

    const totalKgInPlatform = Math.round(totalQtyAgg[0]?.totalQty || 0);
    const completedKg = Math.round(completedQtyAgg[0]?.totalQty || 0);
    const estimatedKgRescued = totalKgInPlatform;
    const mealsProvided = Math.round(estimatedKgRescued * 2.2);
    const co2PreventedKg = Math.round(estimatedKgRescued * 2.5);

    res.status(200).json({
      success: true,
      stats: {
        totalDonations: totalDonationsCount,
        completedPickups: completedPickupsCount,
        activeListings: activeListingsCount,
        totalDonors: totalDonorsCount,
        totalRecipients: totalRecipientsCount,
        estimatedKgRescued,
        completedKgRescued: completedKg,
        mealsProvided,
        co2PreventedKg,
      },
    });
  } catch (err) {
    next(err);
  }
}
