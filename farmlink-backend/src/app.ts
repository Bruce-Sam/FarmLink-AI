import express, { type Express, type Request, type Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { config } from './config/env';
import { logger } from './config/logger';
import { requestId } from './middlewares/request-id.middleware';
import { apiRateLimiter } from './middlewares/rate-limit.middleware';
import { notFound } from './middlewares/not-found.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { apiRouter } from './routes';
import { healthCheck } from './routes/health.controller';
import { mountSwagger } from './config/swagger';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);

  // Request correlation must run before logging so logs carry the request id.
  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => (req as Request).id,
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    }),
  );

  app.use(helmet());
  app.use(
    cors({
      origin: config.CORS_ORIGINS,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Lightweight root + top-level health check (no /api/v1 prefix).
  app.get('/', (_req: Request, res: Response) => {
    res.json({ service: 'farmlink-api', docs: '/api/docs', health: '/health' });
  });
  app.get('/health', healthCheck);

  mountSwagger(app);

  app.use('/api/v1', apiRateLimiter, apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
