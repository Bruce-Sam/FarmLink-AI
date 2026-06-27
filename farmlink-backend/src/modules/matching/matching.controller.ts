import { type Request, type Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { successResponse, buildPaginationMeta } from '../../utils/api-response';
import { ApiError } from '../../utils/api-error';
import { paginationQuerySchema } from '../../utils/pagination';
import { matchingService } from './matching.service';

export const getBuyerRecommendations = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const query = paginationQuerySchema.parse(req.query);
  const { items, total } = await matchingService.listBuyerRecommendations(req.user.id, query);
  successResponse(res, {
    message: 'Recommendations retrieved',
    data: { recommendations: items },
    meta: buildPaginationMeta(total, query.page, query.limit),
  });
});
