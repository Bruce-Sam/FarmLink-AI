import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { uuidParam } from '../../utils/common-schemas';
import {
  cancelListing,
  createListing,
  extractListing,
  getListingById,
  getListingMatches,
  getMyListings,
  publishListing,
  updateListing,
} from './listings.controller';

const router = Router();
const listingParam = { params: uuidParam('listingId') };

router.use(authenticate, authorize(Role.FARMER));

router.post('/extract', extractListing);
router.post('/', createListing);
router.get('/my', getMyListings);
router.get('/:listingId', validate(listingParam), getListingById);
router.patch('/:listingId', validate(listingParam), updateListing);
router.post('/:listingId/publish', validate(listingParam), publishListing);
router.post('/:listingId/cancel', validate(listingParam), cancelListing);
router.get('/:listingId/matches', validate(listingParam), getListingMatches);

export const listingsRoutes = router;
