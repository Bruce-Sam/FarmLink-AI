import { type NextFunction, type Request, type Response } from 'express';
import { AccountStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { ApiError } from '../utils/api-error';
import { verifyAccessToken } from '../utils/jwt';
import { asyncHandler } from '../utils/async-handler';

function extractBearerToken(req: Request): string | null {
  const header = req.header('authorization');
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
}

// Verifies the JWT, loads the user, and enforces account-status checks.
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractBearerToken(req);
    if (!token) {
      throw ApiError.unauthorized('Authentication required');
    }

    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, accountStatus: true },
    });

    if (!user) {
      throw ApiError.unauthorized('Account no longer exists');
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      throw ApiError.forbidden('Your account is not active. Please contact support.');
    }

    req.user = { id: user.id, role: user.role };
    next();
  },
);
