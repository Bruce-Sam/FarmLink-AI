import { type BuyerDemand, type BuyerProfile } from '@prisma/client';
import { prisma } from '../../config/database';
import { ApiError } from '../../utils/api-error';
import {
  type CreateBuyerProfileInput,
  type CreateDemandInput,
  type UpdateBuyerProfileInput,
  type UpdateDemandInput,
} from './buyers.schema';

export class BuyersService {
  async createProfile(userId: string, input: CreateBuyerProfileInput): Promise<BuyerProfile> {
    const existing = await prisma.buyerProfile.findUnique({ where: { userId } });
    if (existing) {
      throw ApiError.conflict('Buyer profile already exists. Use update instead.');
    }
    return prisma.buyerProfile.create({ data: { userId, ...input } });
  }

  async getProfile(userId: string): Promise<BuyerProfile> {
    const profile = await prisma.buyerProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw ApiError.notFound('Buyer profile not found. Please complete your profile.');
    }
    return profile;
  }

  async updateProfile(userId: string, input: UpdateBuyerProfileInput): Promise<BuyerProfile> {
    await this.getProfile(userId);
    return prisma.buyerProfile.update({ where: { userId }, data: input });
  }

  async requireProfileId(userId: string): Promise<string> {
    const profile = await prisma.buyerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw ApiError.badRequest('Create your buyer profile before performing this action');
    }
    return profile.id;
  }

  // ----- Demands -----

  private async assertCategoryExists(categoryId: string): Promise<void> {
    const category = await prisma.produceCategory.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!category) throw ApiError.badRequest('Unknown produce category');
  }

  async createDemand(userId: string, input: CreateDemandInput): Promise<BuyerDemand> {
    const buyerId = await this.requireProfileId(userId);
    await this.assertCategoryExists(input.categoryId);
    return prisma.buyerDemand.create({ data: { buyerId, ...input } });
  }

  async listDemands(userId: string): Promise<BuyerDemand[]> {
    const buyerId = await this.requireProfileId(userId);
    return prisma.buyerDemand.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
  }

  async getDemand(userId: string, demandId: string) {
    await this.requireOwnedDemand(userId, demandId);
    const demand = await prisma.buyerDemand.findUnique({
      where: { id: demandId },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    if (!demand) throw ApiError.notFound('Demand not found');
    return demand;
  }

  private async requireOwnedDemand(userId: string, demandId: string): Promise<string> {
    const buyerId = await this.requireProfileId(userId);
    const demand = await prisma.buyerDemand.findUnique({
      where: { id: demandId },
      select: { id: true, buyerId: true },
    });
    if (!demand || demand.buyerId !== buyerId) {
      throw ApiError.notFound('Demand not found');
    }
    return demand.id;
  }

  async updateDemand(
    userId: string,
    demandId: string,
    input: UpdateDemandInput,
  ): Promise<BuyerDemand> {
    await this.requireOwnedDemand(userId, demandId);
    if (input.categoryId) await this.assertCategoryExists(input.categoryId);
    return prisma.buyerDemand.update({ where: { id: demandId }, data: input });
  }

  async deleteDemand(userId: string, demandId: string): Promise<void> {
    await this.requireOwnedDemand(userId, demandId);
    await prisma.buyerDemand.delete({ where: { id: demandId } });
  }
}

export const buyersService = new BuyersService();
