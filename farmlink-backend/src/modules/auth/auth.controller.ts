import { type Request, type Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { successResponse } from '../../utils/api-response';
import { ApiError } from '../../utils/api-error';
import { authService } from './auth.service';
import { loginSchema, registerSchema } from './auth.schema';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);
  const result = await authService.register(input);
  successResponse(res, {
    statusCode: 201,
    message: 'Account created successfully',
    data: result,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input);
  successResponse(res, { message: 'Logged in successfully', data: result });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const user = await authService.getCurrentUser(req.user.id);
  successResponse(res, { message: 'Current user retrieved', data: { user } });
});
