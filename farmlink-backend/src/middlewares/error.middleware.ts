import { type NextFunction, type Request, type Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { ApiError, type ApiErrorCode } from '../utils/api-error';
import { formatZodIssues } from './validate.middleware';
import { type ApiErrorBody } from '../types/api';
import { config } from '../config/env';
import { logger } from '../config/logger';

interface NormalizedError {
  statusCode: number;
  code: ApiErrorCode;
  message: string;
  details?: unknown;
}

function normalize(error: unknown): NormalizedError {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof ZodError) {
    return {
      statusCode: 422,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: formatZodIssues(error),
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const target = (error.meta?.target as string[] | undefined)?.join(', ');
      return {
        statusCode: 409,
        code: 'CONFLICT',
        message: target ? `A record with this ${target} already exists` : 'Duplicate record',
      };
    }
    if (error.code === 'P2025') {
      return { statusCode: 404, code: 'NOT_FOUND', message: 'Resource not found' };
    }
  }

  return {
    statusCode: 500,
    code: 'INTERNAL_ERROR',
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
  };
}

// Centralized error handler. Must be registered last and keep the 4-arg signature.
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const normalized = normalize(error);

  if (normalized.statusCode >= 500) {
    logger.error({ err: error, requestId: req.id }, 'Unhandled server error');
  } else {
    logger.warn({ requestId: req.id, code: normalized.code }, normalized.message);
  }

  // In production, mask internal error messages to prevent leaking stack traces or sensitive details.
  const isInternalError = normalized.statusCode >= 500;
  const hideDetails = config.isProduction && isInternalError;

  const body: ApiErrorBody = {
    success: false,
    message: hideDetails ? 'An unexpected error occurred' : normalized.message,
    error: {
      code: normalized.code,
      details:
        hideDetails ? undefined : normalized.details,
    },
    requestId: String(req.id),
  };

  res.status(normalized.statusCode).json(body);
}
