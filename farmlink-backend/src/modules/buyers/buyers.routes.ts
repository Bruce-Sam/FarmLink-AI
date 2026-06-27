import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { uuidParam } from '../../utils/common-schemas';
import {
  createBuyerProfile,
  createDemand,
  deleteDemand,
  getBuyerProfile,
  listDemands,
  updateBuyerProfile,
  updateDemand,
} from './buyers.controller';
import { getBuyerRecommendations } from '../matching/matching.controller';
import {
  cancelOffer,
  getBuyerOffer,
  listBuyerOffers,
  listBuyerTransactions,
} from '../offers/offers.controller';

const router = Router();
const demandParam = { params: uuidParam('demandId') };
const offerParam = { params: uuidParam('offerId') };

router.use(authenticate, authorize(Role.BUYER));

router.post('/profile', createBuyerProfile);
router.get('/profile', getBuyerProfile);
router.patch('/profile', updateBuyerProfile);

router.post('/demands', createDemand);
router.get('/demands', listDemands);
router.patch('/demands/:demandId', validate(demandParam), updateDemand);
router.delete('/demands/:demandId', validate(demandParam), deleteDemand);

router.get('/recommendations', getBuyerRecommendations);

router.get('/offers', listBuyerOffers);
router.get('/offers/:offerId', validate(offerParam), getBuyerOffer);
router.post('/offers/:offerId/cancel', validate(offerParam), cancelOffer);

router.get('/transactions', listBuyerTransactions);

export const buyersRoutes = router;
