import { Router } from 'express';
import { authRateLimiter } from '../../middlewares/rate-limit.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { login, me, register } from './auth.controller';

const router = Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.get('/me', authenticate, me);

export const authRoutes = router;
