import { type NextFunction, type Request, type Response } from 'express';
import { type Role } from '@prisma/client';
import { ApiError } from '../utils/api-error';

// Restricts a route to one or more roles. Must run after `authenticate`.
export function authorize(...allowed: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }
    if (!allowed.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to access this resource');
    }
    next();
  };
}
