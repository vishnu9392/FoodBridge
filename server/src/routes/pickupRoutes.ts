import { Router } from 'express';
import {
  createPickupRequest,
  getUserPickups,
  getPickupById,
  updatePickupStatus,
} from '../controllers/pickupController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Pickup creation: Any authenticated community member (recipient, donor, admin) can request surplus food from another donor
router.post('/', authenticate, createPickupRequest);

// Pickup listing & detail for involved users
router.get('/', authenticate, getUserPickups);
router.get('/:id', authenticate, getPickupById);

// Status updates (approve, reject, complete, cancel)
router.patch('/:id/status', authenticate, updatePickupStatus);

export default router;
