import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { uuidParam } from '../../utils/common-schemas';
import {
  getDashboard,
  getListing,
  getUser,
  listAuditLogs,
  listListings,
  listMatches,
  listOffers,
  listTransactions,
  listUsers,
  regenerateMatches,
  updateListingStatus,
  updateUserStatus,
} from './admin.controller';

const router = Router();

router.use(authenticate, authorize(Role.ADMIN));

router.get('/dashboard', getDashboard);

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

export const adminRoutes = router;
