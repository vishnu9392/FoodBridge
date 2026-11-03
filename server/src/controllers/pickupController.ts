import { Request, Response, NextFunction } from 'express';
import { Pickup, IPickup, PickupStatus } from '../models/Pickup';
import { Donation } from '../models/Donation';
import { validateStatusTransition } from '../services/pickupService';
import { calculateExpiryStatus, getTimeRemaining } from '../services/expiryService';

export async function createPickupRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const {
      donationId,
      requestedQuantity = 1,
      preferredDate,
      preferredTime,
      notes,
      requestedPickupTime,
    } = req.body;

    if (!donationId) {
      res.status(400).json({ success: false, message: 'Donation ID is required.' });
      return;
    }

    const donation = await Donation.findById(donationId);
    if (!donation) {
      res.status(404).json({ success: false, message: 'Donation listing not found.' });
      return;
    }

    // Rule: Prevent users from picking up their own donations
    if (donation.donor.toString() === req.user.id) {
      res.status(400).json({
        success: false,
        message: 'You cannot request a pickup for food that you donated.',
      });
      return;
    }

    // Rule: Donation must be available and unexpired
    if (donation.status !== 'available') {
      res.status(400).json({
        success: false,
        message: `This donation is currently ${donation.status} and cannot be requested.`,
      });
      return;
    }

    const expiryStatus = calculateExpiryStatus(donation.expiryDate);
    if (expiryStatus === 'expired') {
      res.status(400).json({
        success: false,
        message: 'This food donation has expired and cannot be reserved.',
      });
      return;
    }

    // Validate requested quantity
    const parsedQty = Number(requestedQuantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      res.status(400).json({
        success: false,
        message: 'Requested quantity must be a positive number.',
      });
      return;
    }

    const currentAvailable = Math.max(0, donation.quantity - (donation.reservedQuantity || 0));
    if (currentAvailable <= 0) {
      res.status(400).json({
        success: false,
        message: 'This donation has already been fully claimed or reserved.',
      });
      return;
    }

    if (parsedQty > currentAvailable) {
      res.status(400).json({
        success: false,
        message: `Only ${currentAvailable} ${donation.unit} available for pickup. You requested ${parsedQty}.`,
      });
      return;
    }

    // Rule: Prevent duplicate active pickup requests for the same donation by this recipient
    const existingActiveRequest = await Pickup.findOne({
      donation: donationId,
      recipient: req.user.id,
      status: { $in: ['pending', 'approved'] },
    });

    if (existingActiveRequest) {
      res.status(409).json({
        success: false,
        message: 'You already have an active pickup request for this donation.',
      });
      return;
    }

    const pickup = await Pickup.create({
      donation: donationId,
      recipient: req.user.id,
      donor: donation.donor,
      status: 'pending',
      requestedQuantity: parsedQty,
      preferredDate: preferredDate ? String(preferredDate).trim() : undefined,
      preferredTime: preferredTime ? String(preferredTime).trim() : undefined,
      notes: notes ? notes.trim() : '',
      requestedPickupTime: requestedPickupTime ? new Date(requestedPickupTime) : undefined,
    });

    const populated = await pickup.populate([
      { path: 'donation' },
      { path: 'recipient', select: 'name email phone organization' },
      { path: 'donor', select: 'name email phone organization' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Pickup request submitted successfully to the donor.',
      pickup: populated,
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserPickups(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { role = 'all', status } = req.query;
    const query: Record<string, any> = {};

    if (role === 'recipient') {
      query.recipient = req.user.id;
    } else if (role === 'donor') {
      query.donor = req.user.id;
    } else {
      query.$or = [{ recipient: req.user.id }, { donor: req.user.id }];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const pickups = await Pickup.find(query)
      .populate('donation')
      .populate('recipient', 'name email phone organization')
      .populate('donor', 'name email phone organization')
      .sort({ createdAt: -1 });

    const formatted = pickups.map((p) => {
      const pJson = p.toJSON();
      if (p.donation && typeof p.donation === 'object' && 'expiryDate' in p.donation) {
        const donationObj: any = p.donation;
        donationObj.expiryStatus = calculateExpiryStatus(donationObj.expiryDate);
        donationObj.timeRemaining = getTimeRemaining(donationObj.expiryDate);
      }

      // Hide private donor phone/email from recipient while status is pending
      const recipientId = (p.recipient as any)?._id?.toString() || p.recipient?.toString();
      const isRecipient = req.user && recipientId === req.user.id;
      if (isRecipient && p.status === 'pending' && (pJson as any).donor) {
        const donorObj: any = (pJson as any).donor;
        (pJson as any).donor = {
          id: donorObj._id || donorObj.id,
          name: donorObj.name,
          organization: donorObj.organization,
        };
      }

      return pJson;
    });

    res.status(200).json({
      success: true,
      total: formatted.length,
      pickups: formatted,
    });
  } catch (err) {
    next(err);
  }
}

export async function getPickupById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const pickup = await Pickup.findById(id)
      .populate('donation')
      .populate('recipient', 'name email phone organization')
      .populate('donor', 'name email phone organization');

    if (!pickup) {
      res.status(404).json({ success: false, message: 'Pickup request not found.' });
      return;
    }

    const isDonor = pickup.donor._id.toString() === req.user.id;
    const isRecipient = pickup.recipient._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isDonor && !isRecipient && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You are not a participant in this pickup request.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      pickup,
    });
  } catch (err) {
    next(err);
  }
}

export async function updatePickupStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { status: targetStatus, reason } = req.body;

    if (!targetStatus) {
      res.status(400).json({ success: false, message: 'Target status is required.' });
      return;
    }

    const pickup = await Pickup.findById(id);
    if (!pickup) {
      res.status(404).json({ success: false, message: 'Pickup request not found.' });
      return;
    }

    const isDonor = pickup.donor.toString() === req.user.id || req.user.role === 'admin';
    const isRecipient = pickup.recipient.toString() === req.user.id;

    // Validate state transition through pure state machine
    const validation = validateStatusTransition(
      pickup.status,
      targetStatus as PickupStatus,
      isDonor,
      isRecipient
    );

    if (!validation.valid) {
      res.status(400).json({
        success: false,
        message: validation.message,
      });
      return;
    }

    const donation = await Donation.findById(pickup.donation);

    // Apply status timestamps
    const previousStatus = pickup.status;
    const now = new Date();

    if (targetStatus === 'approved') {
      if (donation) {
        const remaining = Math.max(0, donation.quantity - (donation.reservedQuantity || 0));
        if (pickup.requestedQuantity > remaining) {
          res.status(400).json({
            success: false,
            message: `Cannot approve request: only ${remaining} ${donation.unit} remaining, but request asked for ${pickup.requestedQuantity} ${donation.unit}.`,
          });
          return;
        }

        donation.reservedQuantity = (donation.reservedQuantity || 0) + pickup.requestedQuantity;
        if (donation.reservedQuantity >= donation.quantity) {
          donation.status = 'reserved';
        }
        await donation.save();
      }
      pickup.status = 'approved';
      pickup.approvedAt = now;
    } else if (targetStatus === 'completed') {
      if (donation) {
        donation.quantity = Math.max(0, donation.quantity - pickup.requestedQuantity);
        donation.reservedQuantity = Math.max(0, (donation.reservedQuantity || 0) - pickup.requestedQuantity);
        if (donation.quantity <= 0) {
          donation.status = 'completed';
        } else if (donation.status === 'reserved' && donation.quantity > donation.reservedQuantity) {
          donation.status = 'available';
        }
        await donation.save();
      }
      pickup.status = 'completed';
      pickup.completedAt = now;
    } else if (targetStatus === 'cancelled' || targetStatus === 'rejected') {
      if (previousStatus === 'approved' && donation) {
        donation.reservedQuantity = Math.max(0, (donation.reservedQuantity || 0) - pickup.requestedQuantity);
        if (donation.status === 'reserved' && donation.quantity > donation.reservedQuantity) {
          donation.status = 'available';
        }
        await donation.save();
      }
      pickup.status = targetStatus as PickupStatus;
      pickup.cancelledAt = now;
      if (reason) pickup.cancellationReason = reason.trim();
    }

    await pickup.save();

    const populated = await pickup.populate([
      { path: 'donation' },
      { path: 'recipient', select: 'name email phone organization' },
      { path: 'donor', select: 'name email phone organization' },
    ]);

    res.status(200).json({
      success: true,
      message: `Pickup request status updated to ${targetStatus}.`,
      pickup: populated,
    });
  } catch (err) {
    next(err);
  }
}
