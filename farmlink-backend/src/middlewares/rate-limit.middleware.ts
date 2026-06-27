import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

const handlerBody = (code: string, message: string) => ({
  success: false,
  message,
  error: { code },
});

// Applied to the whole API surface.
export const apiRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: handlerBody('RATE_LIMITED', 'Too many requests, please slow down'),
});

// Stricter limiter for authentication endpoints to mitigate brute-force attacks.
export const authRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: handlerBody('RATE_LIMITED', 'Too many authentication attempts, please try again later'),
});
