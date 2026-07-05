import { type Request, type Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { successResponse } from '../../utils/api-response';
import { ApiError } from '../../utils/api-error';
import { getParam } from '../../utils/http';
import { ratingsService } from './ratings.service';
import { createRatingSchema } from './ratings.schema';

function requireUserId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

export const submitRating = asyncHandler(async (req: Request, res: Response) => {
  const input = createRatingSchema.parse(req.body);
  const rating = await ratingsService.createRating(requireUserId(req), input);
  successResponse(res, { statusCode: 201, message: 'Rating submitted', data: { rating } });
});

export const getUserRatingSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await ratingsService.getUserSummary(getParam(req, 'userId'));
  successResponse(res, { message: 'Rating summary retrieved', data: { summary } });
});

export const getFarmerRatingSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await ratingsService.getFarmerProfileSummary(getParam(req, 'farmerId'));
  successResponse(res, { message: 'Farmer rating summary retrieved', data: { summary } });
});

export const getBuyerRatingSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await ratingsService.getBuyerProfileSummary(getParam(req, 'buyerId'));
  successResponse(res, { message: 'Buyer rating summary retrieved', data: { summary } });
});

export const getTransactionRatings = asyncHandler(async (req: Request, res: Response) => {
  const context = await ratingsService.getTransactionRatings(
    requireUserId(req),
    getParam(req, 'transactionId'),
  );
  successResponse(res, { message: 'Transaction ratings retrieved', data: context });
});
