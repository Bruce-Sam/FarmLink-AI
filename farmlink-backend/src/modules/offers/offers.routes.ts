import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { createOffer } from './offers.controller';

const router = Router();

// Buyers create offers against published listings.
router.post('/', authenticate, authorize(Role.BUYER), createOffer);

export const offersRoutes = router;
