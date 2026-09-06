import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorHandler } from '../../src/middlewares/error.middleware';
import { Request, Response, NextFunction } from 'express';
import { config } from '../../src/config/env';
import { ApiError } from '../../src/utils/api-error';

// Mock logger
vi.mock('../../src/config/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('errorHandler', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { id: 'test-req-id' };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    // Reset config mocks if any
  });

  it('hides internal details in production for 500 errors', () => {
    // Save original
    const originalIsProd = config.isProduction;
    config.isProduction = true;

    const error = new Error('Secret DB connection error');
    (error as any).details = 'Sensitive stack trace';

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'An unexpected error occurred',
        error: expect.objectContaining({
          details: undefined
        })
      })
    );

    // Restore original
    config.isProduction = originalIsProd;
  });

  it('shows internal details in development for 500 errors', () => {
    // Save original
    const originalIsProd = config.isProduction;
    config.isProduction = false;

    const error = new Error('Secret DB connection error');
    // For non-ApiError, details aren't populated directly from the error object in the current implementation.
    // The details in normalized error is undefined for unhandled errors. Let's test with ApiError that has details.
    const apiError = new ApiError(500, 'INTERNAL_ERROR', 'Something went wrong', { secret: 'trace' });

    errorHandler(apiError, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Something went wrong',
        error: expect.objectContaining({
          details: { secret: 'trace' }
        })
      })
    );

    // Restore original
    config.isProduction = originalIsProd;
  });
});
