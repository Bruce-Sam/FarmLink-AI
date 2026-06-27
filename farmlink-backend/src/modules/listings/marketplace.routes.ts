import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { uuidParam } from '../../utils/common-schemas';
import { browseMarketplace, getMarketplaceListing } from './listings.controller';

const router = Router();

router.use(authenticate);
router.get('/listings', browseMarketplace);
router.get('/listings/:listingId', validate({ params: uuidParam('listingId') }), getMarketplaceListing);

export const marketplaceRoutes = router;
