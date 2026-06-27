import { type Request, type Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { successResponse } from '../../utils/api-response';
import { getParam } from '../../utils/http';
import { produceService } from './produce.service';

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await produceService.listCategories();
  successResponse(res, { message: 'Categories retrieved', data: { categories } });
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await produceService.getCategory(getParam(req, 'categoryId'));
  successResponse(res, { message: 'Category retrieved', data: { category } });
});
