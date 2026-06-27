import { type Request, type Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { successResponse } from '../../utils/api-response';
import { ApiError } from '../../utils/api-error';
import { farmersService } from './farmers.service';
import { createFarmerProfileSchema, updateFarmerProfileSchema } from './farmers.schema';

function requireUserId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

export const createFarmerProfile = asyncHandler(async (req: Request, res: Response) => {
  const input = createFarmerProfileSchema.parse(req.body);
  const profile = await farmersService.createProfile(requireUserId(req), input);
  successResponse(res, {
    statusCode: 201,
    message: 'Farmer profile created successfully',
    data: { profile },
  });
});

export const getFarmerProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await farmersService.getProfile(requireUserId(req));
  successResponse(res, { message: 'Farmer profile retrieved', data: { profile } });
});

export const updateFarmerProfile = asyncHandler(async (req: Request, res: Response) => {
  const input = updateFarmerProfileSchema.parse(req.body);
  const profile = await farmersService.updateProfile(requireUserId(req), input);
  successResponse(res, { message: 'Farmer profile updated', data: { profile } });
});
