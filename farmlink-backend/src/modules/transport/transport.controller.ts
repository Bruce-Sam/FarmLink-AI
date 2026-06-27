import { type Request, type Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { successResponse } from '../../utils/api-response';
import { ApiError } from '../../utils/api-error';
import { transportService } from './transport.service';

export const getFarmerTransportSuggestions = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const suggestions = await transportService.listForFarmer(req.user.id);
  successResponse(res, { message: 'Transport suggestions retrieved', data: { suggestions } });
});
