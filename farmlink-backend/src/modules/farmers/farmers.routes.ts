import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { uuidParam } from '../../utils/common-schemas';
import { createFarmerProfile, getFarmerProfile, updateFarmerProfile } from './farmers.controller';
import {
  acceptOffer,
  getFarmerOffer,
  listFarmerOffers,
  listFarmerTransactions,
  rejectOffer,
} from '../offers/offers.controller';
import { getFarmerTransportSuggestions } from '../transport/transport.controller';

const router = Router();
const offerParam = { params: uuidParam('offerId') };

router.use(authenticate, authorize(Role.FARMER));

router.post('/profile', createFarmerProfile);
router.get('/profile', getFarmerProfile);
router.patch('/profile', updateFarmerProfile);

router.get('/offers', listFarmerOffers);
router.get('/offers/:offerId', validate(offerParam), getFarmerOffer);
router.post('/offers/:offerId/accept', validate(offerParam), acceptOffer);
router.post('/offers/:offerId/reject', validate(offerParam), rejectOffer);

router.get('/transactions', listFarmerTransactions);
router.get('/transport-suggestions', getFarmerTransportSuggestions);

export const farmersRoutes = router;
