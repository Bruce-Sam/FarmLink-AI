import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { uuidParam } from '../../utils/common-schemas';
import {
  getAnalytics,
  getDashboard,
  getListing,
  getUser,
  listAuditLogs,
  listDemands,
  listListings,
  listMatches,
  listOffers,
  listTransactions,
  listTransportSuggestions,
  listUsers,
  regenerateMatches,
  updateListingStatus,
  updateUserStatus,
} from './admin.controller';

const router = Router();

router.use(authenticate, authorize(Role.ADMIN));

router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);

router.get('/users', listUsers);
router.get('/users/:userId', validate({ params: uuidParam('userId') }), getUser);
router.patch(
  '/users/:userId/status',
  validate({ params: uuidParam('userId') }),
  updateUserStatus,
);

router.get('/listings', listListings);
router.get('/listings/:listingId', validate({ params: uuidParam('listingId') }), getListing);
router.patch(
  '/listings/:listingId/status',
  validate({ params: uuidParam('listingId') }),
  updateListingStatus,
);
router.post(
  '/listings/:listingId/regenerate-matches',
  validate({ params: uuidParam('listingId') }),
  regenerateMatches,
);

router.get('/offers', listOffers);
router.get('/transactions', listTransactions);
router.get('/matches', listMatches);
router.get('/audit-logs', listAuditLogs);
router.get('/demands', listDemands);
router.get('/transport-suggestions', listTransportSuggestions);

export const adminRoutes = router;
