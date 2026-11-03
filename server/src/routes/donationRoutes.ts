import { Router } from 'express';
import {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  getDonorDonations,
} from '../controllers/donationController';
import { authenticate, requireRole, optionalAuth } from '../middleware/authMiddleware';

const router = Router();

// Public / browse routes (with optional auth to personalize if needed)
router.get('/', optionalAuth, getDonations);
router.get('/donor/my-donations', authenticate, getDonorDonations);
router.get('/:id', optionalAuth, getDonationById);

// Donor operations
router.post('/', authenticate, requireRole('donor', 'admin'), createDonation);
router.put('/:id', authenticate, updateDonation);
router.delete('/:id', authenticate, deleteDonation);

export default router;
