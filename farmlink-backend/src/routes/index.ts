import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { produceRoutes } from '../modules/produce/produce.routes';
import { farmersRoutes } from '../modules/farmers/farmers.routes';
import { buyersRoutes } from '../modules/buyers/buyers.routes';
import { listingsRoutes } from '../modules/listings/listings.routes';
import { marketplaceRoutes } from '../modules/listings/marketplace.routes';
import { offersRoutes } from '../modules/offers/offers.routes';
import { notificationsRoutes } from '../modules/notifications/notifications.routes';
import { adminRoutes } from '../modules/admin/admin.routes';
import { ratingsRoutes } from '../modules/ratings/ratings.routes';
import { healthCheck } from './health.controller';

export const apiRouter = Router();

apiRouter.get('/health', healthCheck);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/categories', produceRoutes);
apiRouter.use('/farmers', farmersRoutes);
apiRouter.use('/buyers', buyersRoutes);
apiRouter.use('/listings', listingsRoutes);
apiRouter.use('/marketplace', marketplaceRoutes);
apiRouter.use('/offers', offersRoutes);
apiRouter.use('/notifications', notificationsRoutes);
apiRouter.use('/ratings', ratingsRoutes);
apiRouter.use('/admin', adminRoutes);
