import { type Prisma, MatchStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { buyersService } from '../buyers/buyers.service';
import { serializeListing } from '../listings/listings.serializer';
import { type PaginationParams } from '../../utils/pagination';

const recommendationListingInclude = {
  listing: {
    include: {
      category: { select: { id: true, name: true, slug: true } },
      farmer: {
        select: {
          id: true,
          farmName: true,
          region: true,
          district: true,
          town: true,
          verificationStatus: true,
        },
      },
    },
  },
} satisfies Prisma.MatchRecommendationInclude;

export class MatchingService {
  // Lists a buyer's recommendations and marks freshly-surfaced ones as viewed.
  async listBuyerRecommendations(userId: string, params: PaginationParams) {
    const buyerId = await buyersService.requireProfileId(userId);

    await prisma.matchRecommendation.updateMany({
      where: { buyerId, status: MatchStatus.RECOMMENDED },
      data: { status: MatchStatus.VIEWED, viewedAt: new Date() },
    });

    const where: Prisma.MatchRecommendationWhereInput = {
      buyerId,
      status: { in: [MatchStatus.RECOMMENDED, MatchStatus.VIEWED, MatchStatus.OFFERED] },
    };

    const [items, total] = await Promise.all([
      prisma.matchRecommendation.findMany({
        where,
        include: recommendationListingInclude,
        orderBy: { score: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.matchRecommendation.count({ where }),
    ]);

    const recommendations = items.map((rec) => ({
      ...rec,
      listing: serializeListing(rec.listing),
    }));

    return { items: recommendations, total };
  }
}

export const matchingService = new MatchingService();
