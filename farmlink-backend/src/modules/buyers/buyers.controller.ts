import { type Request, type Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { successResponse } from '../../utils/api-response';
import { ApiError } from '../../utils/api-error';
import { getParam } from '../../utils/http';
import { buyersService } from './buyers.service';
import {
  createBuyerProfileSchema,
  createDemandSchema,
  updateBuyerProfileSchema,
  updateDemandSchema,
} from './buyers.schema';

function requireUserId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

export const createBuyerProfile = asyncHandler(async (req: Request, res: Response) => {
  const input = createBuyerProfileSchema.parse(req.body);
  const profile = await buyersService.createProfile(requireUserId(req), input);
  successResponse(res, {
    statusCode: 201,
    message: 'Buyer profile created successfully',
    data: { profile },
  });
});

export const getBuyerProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await buyersService.getProfile(requireUserId(req));
  successResponse(res, { message: 'Buyer profile retrieved', data: { profile } });
});

export const updateBuyerProfile = asyncHandler(async (req: Request, res: Response) => {
  const input = updateBuyerProfileSchema.parse(req.body);
  const profile = await buyersService.updateProfile(requireUserId(req), input);
  successResponse(res, { message: 'Buyer profile updated', data: { profile } });
});

export const createDemand = asyncHandler(async (req: Request, res: Response) => {
  const input = createDemandSchema.parse(req.body);
  const demand = await buyersService.createDemand(requireUserId(req), input);
  successResponse(res, {
    statusCode: 201,
    message: 'Demand created successfully',
    data: { demand },
  });
});

export const listDemands = asyncHandler(async (req: Request, res: Response) => {
  const demands = await buyersService.listDemands(requireUserId(req));
  successResponse(res, { message: 'Demands retrieved', data: { demands } });
});

export const updateDemand = asyncHandler(async (req: Request, res: Response) => {
  const input = updateDemandSchema.parse(req.body);
  const demand = await buyersService.updateDemand(requireUserId(req), getParam(req, 'demandId'), input);
  successResponse(res, { message: 'Demand updated', data: { demand } });
});

export const deleteDemand = asyncHandler(async (req: Request, res: Response) => {
  await buyersService.deleteDemand(requireUserId(req), getParam(req, 'demandId'));
  successResponse(res, { message: 'Demand deleted', data: { deleted: true } });
});
