import { Router } from 'express';
import {
  getDonorDashboardStats,
  getPlatformStats,
} from '../controllers/dashboardController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Public platform impact metrics
router.get('/platform', getPlatformStats);

// Authenticated donor dashboard metrics
router.get('/donor', authenticate, getDonorDashboardStats);

export default router;
