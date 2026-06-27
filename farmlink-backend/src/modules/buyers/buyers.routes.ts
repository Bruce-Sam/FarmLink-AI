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
  getDemand,
  listDemands,
  updateBuyerProfile,
  updateDemand,
} from './buyers.controller';
import {
  cancelOffer,
  getBuyerOffer,
  getBuyerTransaction,
  listBuyerOffers,
  listBuyerTransactions,
} from '../offers/offers.controller';
import { getBuyerRecommendation, getBuyerRecommendations } from '../matching/matching.controller';

const router = Router();
const demandParam = { params: uuidParam('demandId') };
const offerParam = { params: uuidParam('offerId') };
const transactionParam = { params: uuidParam('transactionId') };
const recommendationParam = { params: uuidParam('recommendationId') };

router.use(authenticate, authorize(Role.BUYER));

router.post('/profile', createBuyerProfile);
router.get('/profile', getBuyerProfile);
router.patch('/profile', updateBuyerProfile);

router.post('/demands', createDemand);
router.get('/demands', listDemands);
router.get('/demands/:demandId', validate(demandParam), getDemand);
router.patch('/demands/:demandId', validate(demandParam), updateDemand);
router.delete('/demands/:demandId', validate(demandParam), deleteDemand);

router.get('/recommendations', getBuyerRecommendations);
router.get(
  '/recommendations/:recommendationId',
  validate(recommendationParam),
  getBuyerRecommendation,
);

router.get('/offers', listBuyerOffers);
router.get('/offers/:offerId', validate(offerParam), getBuyerOffer);
router.post('/offers/:offerId/cancel', validate(offerParam), cancelOffer);

router.get('/transactions', listBuyerTransactions);
router.get('/transactions/:transactionId', validate(transactionParam), getBuyerTransaction);

export const buyersRoutes = router;
