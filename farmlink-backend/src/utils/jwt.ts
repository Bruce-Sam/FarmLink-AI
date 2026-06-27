import jwt, { type SignOptions } from 'jsonwebtoken';
import { type Role } from '@prisma/client';
import { config } from '../config/env';
import { ApiError } from './api-error';

export interface JwtPayload {
  sub: string;
  role: Role;
}

export function signAccessToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);
    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      typeof decoded.sub === 'string' &&
      typeof (decoded as { role?: unknown }).role === 'string'
    ) {
      return { sub: decoded.sub, role: (decoded as { role: Role }).role };
    }
    throw ApiError.unauthorized('Invalid authentication token');
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.unauthorized('Invalid or expired authentication token');
  }
}
