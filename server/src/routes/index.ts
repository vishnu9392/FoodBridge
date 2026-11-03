import { Router } from 'express';
import authRoutes from './authRoutes';
import donationRoutes from './donationRoutes';
import pickupRoutes from './pickupRoutes';
import dashboardRoutes from './dashboardRoutes';
import expiryRoutes from './expiryRoutes';
import healthRoutes from './healthRoutes';
import { runDatabaseSeed } from '../controllers/seedController';
import { requireDatabase } from '../middleware/dbGuard';

const apiRouter = Router();

// Health check always accessible for diagnostics
apiRouter.use('/health', healthRoutes);

// Algorithmic shelf life intelligence (runs rule engine, doesn't strictly need DB)
apiRouter.use('/expiry', expiryRoutes);

// Endpoints requiring operational database
apiRouter.use('/auth', requireDatabase, authRoutes);
apiRouter.use('/donations', requireDatabase, donationRoutes);
apiRouter.use('/pickups', requireDatabase, pickupRoutes);
apiRouter.use('/dashboard', requireDatabase, dashboardRoutes);
apiRouter.post('/seed', requireDatabase, runDatabaseSeed);

export default apiRouter;
