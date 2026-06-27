import { type Request, type Response } from 'express';
import { type ApiErrorBody } from '../types/api';

export function notFound(req: Request, res: Response): void {
  const body: ApiErrorBody = {
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    error: { code: 'NOT_FOUND' },
    requestId: String(req.id),
  };
  res.status(404).json(body);
}
