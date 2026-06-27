import { type FarmerProfile } from '@prisma/client';
import { prisma } from '../../config/database';
import { ApiError } from '../../utils/api-error';
import {
  type CreateFarmerProfileInput,
  type UpdateFarmerProfileInput,
} from './farmers.schema';

export class FarmersService {
  async createProfile(userId: string, input: CreateFarmerProfileInput): Promise<FarmerProfile> {
    const existing = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (existing) {
      throw ApiError.conflict('Farmer profile already exists. Use update instead.');
    }
    return prisma.farmerProfile.create({
      data: {
        userId,
        farmName: input.farmName,
        description: input.description,
        region: input.region,
        district: input.district,
        town: input.town,
        latitude: input.latitude,
        longitude: input.longitude,
        primaryCrops: input.primaryCrops,
        farmSizeAcres: input.farmSizeAcres,
      },
    });
  }

  async getProfile(userId: string): Promise<FarmerProfile> {
    const profile = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw ApiError.notFound('Farmer profile not found. Please complete your profile.');
    }
    return profile;
  }

  async updateProfile(userId: string, input: UpdateFarmerProfileInput): Promise<FarmerProfile> {
    await this.getProfile(userId);
    return prisma.farmerProfile.update({
      where: { userId },
      data: input,
    });
  }

  // Resolves the FarmerProfile id for an authenticated farmer user.
  async requireProfileId(userId: string): Promise<string> {
    const profile = await prisma.farmerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw ApiError.badRequest('Create your farmer profile before performing this action');
    }
    return profile.id;
  }
}

export const farmersService = new FarmersService();
