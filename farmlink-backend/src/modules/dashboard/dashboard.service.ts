import {
  ListingStatus,
  MatchStatus,
  OfferStatus,
  Role,
  TransactionStatus,
  VerificationStatus,
} from '@prisma/client';
import { prisma } from '../../config/database';
import { decimalToNumber } from '../../utils/money';

const ACTIVE_LISTING_STATUSES: ListingStatus[] = [
  ListingStatus.PUBLISHED,
  ListingStatus.PARTIALLY_RESERVED,
];

export class DashboardService {
  async adminOverview() {
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalFarmers,
      totalBuyers,
      verifiedFarmers,
      activeListings,
      pendingOffers,
      acceptedOffers,
      completedTransactions,
      successfulMatches,
      transactionValue,
      matchScore,
      listingsByCategoryRaw,
      listingsByRegionRaw,
      expiringListings,
      recentActivities,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.FARMER } }),
      prisma.user.count({ where: { role: Role.BUYER } }),
      prisma.farmerProfile.count({ where: { verificationStatus: VerificationStatus.VERIFIED } }),
      prisma.produceListing.count({ where: { status: { in: ACTIVE_LISTING_STATUSES } } }),
      prisma.offer.count({ where: { status: OfferStatus.PENDING } }),
      prisma.offer.count({ where: { status: OfferStatus.ACCEPTED } }),
      prisma.produceTransaction.count({ where: { status: TransactionStatus.COMPLETED } }),
      prisma.matchRecommendation.count({ where: { status: MatchStatus.CONVERTED } }),
      prisma.produceTransaction.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: TransactionStatus.CANCELLED } },
      }),
      prisma.matchRecommendation.aggregate({ _avg: { score: true } }),
      prisma.produceListing.groupBy({
        by: ['categoryId'],
        _count: { _all: true },
        where: { status: { in: ACTIVE_LISTING_STATUSES } },
      }),
      prisma.produceListing.groupBy({
        by: ['region'],
        _count: { _all: true },
        where: { status: { in: ACTIVE_LISTING_STATUSES } },
      }),
      prisma.produceListing.count({
        where: {
          status: { in: ACTIVE_LISTING_STATUSES },
          availableUntil: { not: null, lte: sevenDaysFromNow, gte: new Date() },
        },
      }),
      prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);

    const categories = await prisma.produceCategory.findMany({
      where: { id: { in: listingsByCategoryRaw.map((row) => row.categoryId) } },
      select: { id: true, name: true },
    });
    const categoryName = new Map(categories.map((c) => [c.id, c.name]));

    return {
      totals: {
        users: totalUsers,
        farmers: totalFarmers,
        buyers: totalBuyers,
        verifiedFarmers,
        activeListings,
        pendingOffers,
        acceptedOffers,
        completedTransactions,
        successfulMatches,
        listingsApproachingExpiration: expiringListings,
      },
      estimatedTotalTransactionValue: decimalToNumber(transactionValue._sum.totalAmount) ?? 0,
      averageMatchScore: matchScore._avg.score ? Math.round(matchScore._avg.score * 10) / 10 : 0,
      listingsByCategory: listingsByCategoryRaw.map((row) => ({
        categoryId: row.categoryId,
        category: categoryName.get(row.categoryId) ?? 'Unknown',
        count: row._count._all,
      })),
      listingsByRegion: listingsByRegionRaw.map((row) => ({
        region: row.region,
        count: row._count._all,
      })),
      recentActivities,
    };
  }
}

export const dashboardService = new DashboardService();
