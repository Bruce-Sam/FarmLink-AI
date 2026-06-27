import { type Request, type Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { checkDatabaseHealth } from '../config/database';
import { config } from '../config/env';

export const healthCheck = asyncHandler(async (_req: Request, res: Response) => {
  const databaseHealthy = await checkDatabaseHealth();
  res.status(databaseHealthy ? 200 : 503).json({
    success: databaseHealthy,
    status: databaseHealthy ? 'healthy' : 'degraded',
    service: 'farmlink-api',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    database: databaseHealthy ? 'connected' : 'unavailable',
  });
});
