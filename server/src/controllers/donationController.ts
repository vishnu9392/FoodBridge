import { Request, Response, NextFunction } from 'express';
import { Donation, IDonation } from '../models/Donation';
import { Pickup } from '../models/Pickup';
import { validateDonationDates, validateQuantity } from '../utils/validation';
import { calculateExpiryStatus, getTimeRemaining } from '../services/expiryService';

export async function createDonation(
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
      foodName,
      category,
      quantity,
      unit,
      prepDate,
      expiryDate,
      location,
      description,
      imageUrl,
      dietaryInfo,
    } = req.body;

    if (!foodName || !foodName.trim()) {
      res.status(400).json({ success: false, message: 'Food item name is required.' });
      return;
    }

    if (!category) {
      res.status(400).json({ success: false, message: 'Food category is required.' });
      return;
    }

    const qtyValidation = validateQuantity(quantity);
    if (!qtyValidation.valid) {
      res.status(400).json({ success: false, message: qtyValidation.error });
      return;
    }

    const dateValidation = validateDonationDates(prepDate, expiryDate);
    if (!dateValidation.valid) {
      res.status(400).json({ success: false, message: dateValidation.error });
      return;
    }

    if (!location || !location.address || !location.city) {
      res.status(400).json({
        success: false,
        message: 'Pickup address and city are required.',
      });
      return;
    }

    const parsedCoordinates =
      location.coordinates &&
      !isNaN(Number(location.coordinates.latitude)) &&
      !isNaN(Number(location.coordinates.longitude))
        ? {
            latitude: Number(location.coordinates.latitude),
            longitude: Number(location.coordinates.longitude),
          }
        : undefined;

    const donation = await Donation.create({
      donor: req.user.id,
      foodName: foodName.trim(),
      category,
      quantity: Number(quantity),
      reservedQuantity: 0,
      unit: unit || 'portions',
      prepDate: new Date(prepDate),
      expiryDate: new Date(expiryDate),
      location: {
        address: location.address.trim(),
        locality: location.locality ? location.locality.trim() : '',
        city: location.city.trim(),
        state: location.state ? location.state.trim() : '',
        postalCode: location.postalCode ? location.postalCode.trim() : '',
        landmark: location.landmark ? location.landmark.trim() : '',
        coordinates: parsedCoordinates,
      },
      description: description ? description.trim() : '',
      imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : undefined,
      dietaryInfo: Array.isArray(dietaryInfo) ? dietaryInfo : [],
      status: 'available',
    });

    const populated = await donation.populate('donor', 'name email phone organization');

    const json = populated.toJSON();
    const availableQty = Math.max(0, donation.quantity - (donation.reservedQuantity || 0));

    res.status(201).json({
      success: true,
      message: 'Food donation posted successfully.',
      donation: {
        ...json,
        availableQuantity: availableQty,
        expiryStatus: calculateExpiryStatus(donation.expiryDate),
        timeRemaining: getTimeRemaining(donation.expiryDate),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getDonations(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      search,
      category,
      city,
      status,
      freshness,
      sortBy = 'newest',
      page = '1',
      limit = '20',
      onlyAvailable = 'false',
    } = req.query;

    const query: Record<string, any> = {};
    const now = new Date();

    // Default or explicit recipient view: active, unexpired, available
    if (onlyAvailable === 'true') {
      query.status = 'available';
      query.expiryDate = { $gt: now };
      query.$expr = { $gt: ['$quantity', { $ifNull: ['$reservedQuantity', 0] }] };
    } else if (status) {
      query.status = status;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (city && city !== 'All') {
      query['location.city'] = { $regex: new RegExp(String(city).trim(), 'i') };
    }

    if (search) {
      const term = String(search).trim();
      query.$or = [
        { foodName: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { 'location.locality': { $regex: term, $options: 'i' } },
        { 'location.city': { $regex: term, $options: 'i' } },
      ];
    }

    // Freshness filter (fresh vs expiring_soon)
    if (freshness === 'fresh') {
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      query.expiryDate = { $gt: in24h };
    } else if (freshness === 'expiring_soon') {
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      query.expiryDate = { $gt: now, $lte: in24h };
    } else if (freshness === 'expired') {
      query.expiryDate = { $lte: now };
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy === 'expiry_asc') {
      sortOption = { expiryDate: 1 };
    } else if (sortBy === 'quantity_desc') {
      sortOption = { quantity: -1 };
    } else if (sortBy === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [total, rawDonations] = await Promise.all([
      Donation.countDocuments(query),
      Donation.find(query)
        .populate('donor', 'name organization')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
    ]);

    const donations = rawDonations.map((d) => {
      const json = d.toJSON();
      const isOwner = req.user && req.user.id === d.donor?._id?.toString();
      const availableQty = Math.max(0, d.quantity - (d.reservedQuantity || 0));

      // Public listing sanitization: hide private residential street address
      const sanitizedLocation = {
        ...json.location,
        address: isOwner
          ? json.location?.address
          : (json.location?.locality
              ? `${json.location.locality}, ${json.location.city}`
              : json.location?.city || 'Community Area'),
        isApproximate: !isOwner,
      };

      return {
        ...json,
        location: sanitizedLocation,
        availableQuantity: availableQty,
        expiryStatus: calculateExpiryStatus(d.expiryDate, now),
        timeRemaining: getTimeRemaining(d.expiryDate, now),
      };
    });

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      donations,
    });
  } catch (err) {
    next(err);
  }
}

export async function getDonationById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const donation = await Donation.findById(id).populate(
      'donor',
      'name email phone organization address'
    );

    if (!donation) {
      res.status(404).json({ success: false, message: 'Donation listing not found.' });
      return;
    }

    // Determine privacy authorization: donor themselves, admin, or recipient with approved pickup
    let isAuthorized = false;
    const donorId = (donation.donor as any)?._id?.toString() || donation.donor?.toString();

    if (req.user) {
      if (donorId === req.user.id || req.user.role === 'admin') {
        isAuthorized = true;
      } else {
        const approvedPickup = await Pickup.findOne({
          donation: donation._id,
          recipient: req.user.id,
          status: { $in: ['approved', 'completed'] },
        });
        if (approvedPickup) {
          isAuthorized = true;
        }
      }
    }

    const now = new Date();
    const json = donation.toJSON();
    const availableQty = Math.max(0, donation.quantity - (donation.reservedQuantity || 0));

    // Protect donor contact and exact residential address if not authorized
    let sanitizedDonor: any = json.donor;
    let sanitizedLocation: any = json.location;

    if (!isAuthorized && json.donor) {
      sanitizedDonor = {
        id: (donation.donor as any)?._id || (donation.donor as any)?.id,
        name: (donation.donor as any)?.name,
        organization: (donation.donor as any)?.organization,
      };

      sanitizedLocation = {
        ...json.location,
        address: json.location?.locality
          ? `${json.location.locality}, ${json.location.city}`
          : json.location?.city || 'Community Area',
        isApproximate: true,
      };
    }

    res.status(200).json({
      success: true,
      donation: {
        ...json,
        donor: sanitizedDonor,
        location: sanitizedLocation,
        isAuthorizedContact: isAuthorized,
        availableQuantity: availableQty,
        expiryStatus: calculateExpiryStatus(donation.expiryDate, now),
        timeRemaining: getTimeRemaining(donation.expiryDate, now),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateDonation(
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
    const donation = await Donation.findById(id);

    if (!donation) {
      res.status(404).json({ success: false, message: 'Donation not found.' });
      return;
    }

    // Ownership check: only the donor or an admin can edit
    if (donation.donor.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You can only update your own food donations.',
      });
      return;
    }

    const {
      foodName,
      category,
      quantity,
      unit,
      prepDate,
      expiryDate,
      location,
      description,
      imageUrl,
      dietaryInfo,
      status,
    } = req.body;

    if (quantity !== undefined) {
      const qtyValidation = validateQuantity(quantity);
      if (!qtyValidation.valid) {
        res.status(400).json({ success: false, message: qtyValidation.error });
        return;
      }
      donation.quantity = Number(quantity);
    }

    const currentPrep = prepDate ? new Date(prepDate) : donation.prepDate;
    const currentExpiry = expiryDate ? new Date(expiryDate) : donation.expiryDate;

    if (prepDate || expiryDate) {
      const dateVal = validateDonationDates(currentPrep, currentExpiry);
      if (!dateVal.valid) {
        res.status(400).json({ success: false, message: dateVal.error });
        return;
      }
      donation.prepDate = currentPrep;
      donation.expiryDate = currentExpiry;
    }

    if (foodName && foodName.trim()) donation.foodName = foodName.trim();
    if (category) donation.category = category;
    if (unit) donation.unit = unit;
    if (location && location.address && location.city) {
      donation.location = {
        address: location.address.trim(),
        locality: location.locality ? location.locality.trim() : (donation.location?.locality || ''),
        city: location.city.trim(),
        state: location.state ? location.state.trim() : (donation.location?.state || ''),
        postalCode: location.postalCode ? location.postalCode.trim() : (donation.location?.postalCode || ''),
        landmark: location.landmark ? location.landmark.trim() : (donation.location?.landmark || ''),
        coordinates:
          location.coordinates &&
          !isNaN(Number(location.coordinates.latitude)) &&
          !isNaN(Number(location.coordinates.longitude))
            ? {
                latitude: Number(location.coordinates.latitude),
                longitude: Number(location.coordinates.longitude),
              }
            : donation.location?.coordinates,
      };
    }
    if (description !== undefined) donation.description = description.trim();
    if (imageUrl !== undefined) donation.imageUrl = imageUrl.trim();
    if (dietaryInfo !== undefined && Array.isArray(dietaryInfo)) {
      donation.dietaryInfo = dietaryInfo;
    }
    if (status && ['available', 'reserved', 'completed', 'expired', 'cancelled'].includes(status)) {
      donation.status = status;
    }

    await donation.save();
    const populated = await donation.populate('donor', 'name email phone organization');

    res.status(200).json({
      success: true,
      message: 'Donation updated successfully.',
      donation: {
        ...populated.toJSON(),
        expiryStatus: calculateExpiryStatus(donation.expiryDate),
        timeRemaining: getTimeRemaining(donation.expiryDate),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteDonation(
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
    const donation = await Donation.findById(id);

    if (!donation) {
      res.status(404).json({ success: false, message: 'Donation not found.' });
      return;
    }

    if (donation.donor.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You can only delete your own food donations.',
      });
      return;
    }

    await Donation.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Donation listing removed successfully.',
    });
  } catch (err) {
    next(err);
  }
}

export async function getDonorDonations(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const donations = await Donation.find({ donor: req.user.id }).sort({ createdAt: -1 });
    const now = new Date();

    const formatted = donations.map((d) => ({
      ...d.toJSON(),
      expiryStatus: calculateExpiryStatus(d.expiryDate, now),
      timeRemaining: getTimeRemaining(d.expiryDate, now),
    }));

    res.status(200).json({
      success: true,
      total: formatted.length,
      donations: formatted,
    });
  } catch (err) {
    next(err);
  }
}
