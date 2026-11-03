import { Router } from 'express';
import {
  getExpiryAnalytics,
  calculateCustomEstimate,
} from '../controllers/expiryController';

const router = Router();

router.get('/analytics', getExpiryAnalytics);
router.post('/estimate', calculateCustomEstimate);

export default router;
