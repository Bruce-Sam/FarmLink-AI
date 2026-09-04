import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { ApiError } from '../../src/utils/api-error';
import { Prisma } from '@prisma/client';

vi.mock('../../src/config/env', () => {
  return {
    config: {
      get isProduction() { return process.env.NODE_ENV === 'production'; },
      LOG_LEVEL: 'fatal',
      JWT_ACCESS_SECRET: 'test-secret',
      ADMIN_PASSWORD: 'test-password'
    }
  };
});

// Since errorHandler references logger which references config, we need to bypass logger if it crashes,
// but our mock config prevents that.
import { errorHandler } from '../../src/middlewares/error.middleware';

describe('Error Handler Middleware', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv as any;
  });

  it('in development mode returns 500 errors intact with sensitive message', async () => {
    process.env.NODE_ENV = 'development';

    const app = express();
    app.get('/500', (req, res, next) => {
      next(new Error('This is a sensitive internal error message'));
    });
    app.use(errorHandler);

    const res = await request(app).get('/500');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('This is a sensitive internal error message');
  });

  it('in production mode masks 500 error messages', async () => {
    process.env.NODE_ENV = 'production';

    const app = express();
    app.get('/500', (req, res, next) => {
      next(new Error('This is a sensitive internal error message'));
    });
    app.use(errorHandler);

    const res = await request(app).get('/500');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('An unexpected error occurred');
    expect(res.body.error.details).toBeUndefined();
  });

  it('in production mode keeps 400 errors intact', async () => {
    process.env.NODE_ENV = 'production';

    const app = express();
    app.get('/400', (req, res, next) => {
      next(ApiError.badRequest('Expected 400 error', { field: 'invalid' }));
    });
    app.use(errorHandler);

    const res = await request(app).get('/400');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Expected 400 error');
    expect(res.body.error.details).toEqual({ field: 'invalid' });
  });

  it('masks Prisma errors in production', async () => {
    process.env.NODE_ENV = 'production';

    const app = express();
    app.get('/prisma-error', (req, res, next) => {
      const error = new Prisma.PrismaClientKnownRequestError('Sensitive db details', {
        code: 'P2000',
        clientVersion: '1.0'
      });
      next(error);
    });
    app.use(errorHandler);

    const res = await request(app).get('/prisma-error');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('An unexpected error occurred');
  });
});