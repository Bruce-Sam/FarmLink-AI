import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { uuidParam } from '../../utils/common-schemas';
import {
  getBuyerRatingSummary,
  getFarmerRatingSummary,
  getTransactionRatings,
  getUserRatingSummary,
  submitRating,
} from './ratings.controller';

const router = Router();
const userParam = { params: uuidParam('userId') };
const farmerParam = { params: uuidParam('farmerId') };
const buyerParam = { params: uuidParam('buyerId') };
const transactionParam = { params: uuidParam('transactionId') };

router.post('/', authenticate, submitRating);
router.get('/users/:userId/summary', validate(userParam), getUserRatingSummary);
router.get('/farmers/:farmerId/summary', validate(farmerParam), getFarmerRatingSummary);
router.get('/buyers/:buyerId/summary', validate(buyerParam), getBuyerRatingSummary);
router.get(
  '/transactions/:transactionId',
  authenticate,
  validate(transactionParam),
  getTransactionRatings,
);

export const ratingsRoutes = router;
