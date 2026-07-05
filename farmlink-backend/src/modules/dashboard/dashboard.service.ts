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

const TREND_DAYS = 30;

type DailyRow = { date: Date; count: number };
type DailyValueRow = { date: Date; total: number | null };

function startOfWeek(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateKey(value: Date | string): string {
  return new Date(value).toISOString().slice(0, 10);
}

function buildDailyCountSeries(rows: DailyRow[]): Array<{ date: string; count: number }> {
  const map = new Map(rows.map((row) => [toDateKey(row.date), Number(row.count)]));
  const series: Array<{ date: string; count: number }> = [];
  for (let i = TREND_DAYS - 1; i >= 0; i -= 1) {
    const d = daysAgo(i);
    const key = toDateKey(d);
    series.push({ date: key, count: map.get(key) ?? 0 });
  }
  return series;
}

function buildDailyValueSeries(rows: DailyValueRow[]): Array<{ date: string; value: number }> {
  const map = new Map(rows.map((row) => [toDateKey(row.date), Number(row.total ?? 0)]));
  const series: Array<{ date: string; value: number }> = [];
  for (let i = TREND_DAYS - 1; i >= 0; i -= 1) {
    const d = daysAgo(i);
    const key = toDateKey(d);
    series.push({ date: key, value: map.get(key) ?? 0 });
  }
  return series;
}

function pct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function bucketMatchScore(score: number): string {
  if (score >= 80) return '80–100';
  if (score >= 60) return '60–79';
  if (score >= 40) return '40–59';
  return '0–39';
}

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

  async adminAnalytics() {
    const since = daysAgo(TREND_DAYS);
    const thisWeekStart = startOfWeek();
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const [
      totalListings,
      totalMatches,
      totalOffers,
      acceptedOffers,
      completedTransactions,
      publishedListings,
      offersByStatusRaw,
      transactionsByStatusRaw,
      listingsByStatusRaw,
      matchesByStatusRaw,
      usersByRoleRaw,
      buyersByTypeRaw,
      newUsersLast7Days,
      newUsersLast30Days,
      matchScores,
      ratingsAggregate,
      farmerRatings,
      buyerRatings,
      userTrendRaw,
      listingTrendRaw,
      offerTrendRaw,
      transactionTrendRaw,
      transactionValueTrendRaw,
      listingsThisWeek,
      listingsLastWeek,
      offersThisWeek,
      offersLastWeek,
      transactionsThisWeek,
      transactionsLastWeek,
      gmvThisWeek,
      gmvLastWeek,
      listingsByCategoryRaw,
      listingsByRegionRaw,
      activeDemands,
      averageMatchScoreAgg,
      totalTransactionCount,
    ] = await Promise.all([
      prisma.produceListing.count(),
      prisma.matchRecommendation.count(),
      prisma.offer.count(),
      prisma.offer.count({ where: { status: OfferStatus.ACCEPTED } }),
      prisma.produceTransaction.count({ where: { status: TransactionStatus.COMPLETED } }),
      prisma.produceListing.count({ where: { status: ListingStatus.PUBLISHED } }),
      prisma.offer.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.produceTransaction.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.produceListing.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.matchRecommendation.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      prisma.buyerProfile.groupBy({ by: ['buyerType'], _count: { _all: true } }),
      prisma.user.count({ where: { createdAt: { gte: daysAgo(7) } } }),
      prisma.user.count({ where: { createdAt: { gte: since } } }),
      prisma.matchRecommendation.findMany({ select: { score: true } }),
      prisma.partnerRating.aggregate({ _avg: { score: true }, _count: { score: true } }),
      prisma.partnerRating.aggregate({
        _avg: { score: true },
        where: { ratedRole: 'FARMER' },
      }),
      prisma.partnerRating.aggregate({
        _avg: { score: true },
        where: { ratedRole: 'BUYER' },
      }),
      prisma.$queryRaw<DailyRow[]>`
        SELECT DATE("createdAt") AS date, COUNT(*)::int AS count
        FROM "User"
        WHERE "createdAt" >= ${since}
        GROUP BY DATE("createdAt")
        ORDER BY date
      `,
      prisma.$queryRaw<DailyRow[]>`
        SELECT DATE("createdAt") AS date, COUNT(*)::int AS count
        FROM "ProduceListing"
        WHERE "createdAt" >= ${since}
        GROUP BY DATE("createdAt")
        ORDER BY date
      `,
      prisma.$queryRaw<DailyRow[]>`
        SELECT DATE("createdAt") AS date, COUNT(*)::int AS count
        FROM "Offer"
        WHERE "createdAt" >= ${since}
        GROUP BY DATE("createdAt")
        ORDER BY date
      `,
      prisma.$queryRaw<DailyRow[]>`
        SELECT DATE("createdAt") AS date, COUNT(*)::int AS count
        FROM "ProduceTransaction"
        WHERE "createdAt" >= ${since}
        GROUP BY DATE("createdAt")
        ORDER BY date
      `,
      prisma.$queryRaw<DailyValueRow[]>`
        SELECT DATE("createdAt") AS date, SUM("totalAmount")::float AS total
        FROM "ProduceTransaction"
        WHERE "createdAt" >= ${since}
          AND status <> ${TransactionStatus.CANCELLED}
        GROUP BY DATE("createdAt")
        ORDER BY date
      `,
      prisma.produceListing.count({ where: { createdAt: { gte: thisWeekStart } } }),
      prisma.produceListing.count({
        where: { createdAt: { gte: lastWeekStart, lt: thisWeekStart } },
      }),
      prisma.offer.count({ where: { createdAt: { gte: thisWeekStart } } }),
      prisma.offer.count({
        where: { createdAt: { gte: lastWeekStart, lt: thisWeekStart } },
      }),
      prisma.produceTransaction.count({ where: { createdAt: { gte: thisWeekStart } } }),
      prisma.produceTransaction.count({
        where: { createdAt: { gte: lastWeekStart, lt: thisWeekStart } },
      }),
      prisma.produceTransaction.aggregate({
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: thisWeekStart },
          status: { not: TransactionStatus.CANCELLED },
        },
      }),
      prisma.produceTransaction.aggregate({
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: lastWeekStart, lt: thisWeekStart },
          status: { not: TransactionStatus.CANCELLED },
        },
      }),
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
      prisma.buyerDemand.count({ where: { isActive: true } }),
      prisma.matchRecommendation.aggregate({ _avg: { score: true } }),
      prisma.produceTransaction.count(),
    ]);

    const categories = await prisma.produceCategory.findMany({
      where: { id: { in: listingsByCategoryRaw.map((row) => row.categoryId) } },
      select: { id: true, name: true },
    });
    const categoryName = new Map(categories.map((c) => [c.id, c.name]));

    const userTrend = buildDailyCountSeries(userTrendRaw);
    const listingTrend = buildDailyCountSeries(listingTrendRaw);
    const offerTrend = buildDailyCountSeries(offerTrendRaw);
    const transactionTrend = buildDailyCountSeries(transactionTrendRaw);
    const transactionValueTrend = buildDailyValueSeries(transactionValueTrendRaw);

    const trends = userTrend.map((row, index) => ({
      date: row.date,
      newUsers: row.count,
      newListings: listingTrend[index]?.count ?? 0,
      newOffers: offerTrend[index]?.count ?? 0,
      completedTransactions: transactionTrend[index]?.count ?? 0,
      transactionValue: transactionValueTrend[index]?.value ?? 0,
    }));

    const scoreBuckets = new Map<string, number>([
      ['0–39', 0],
      ['40–59', 0],
      ['60–79', 0],
      ['80–100', 0],
    ]);
    for (const match of matchScores) {
      const bucket = bucketMatchScore(match.score);
      scoreBuckets.set(bucket, (scoreBuckets.get(bucket) ?? 0) + 1);
    }

    const offersWithMatches = await prisma.offer.count({
      where: { listing: { recommendations: { some: {} } } },
    });

    return {
      generatedAt: new Date().toISOString(),
      periodDays: TREND_DAYS,
      trends,
      funnel: {
        publishedListings,
        totalMatches,
        offersSent: totalOffers,
        offersAccepted: acceptedOffers,
        completedTransactions,
        activeDemands,
        conversionRates: {
          listingToMatch: pct(totalMatches, publishedListings),
          matchToOffer: pct(totalOffers, totalMatches),
          offerToAccept: pct(acceptedOffers, totalOffers),
          acceptToComplete: pct(completedTransactions, acceptedOffers),
        },
        offersFromMatchedListings: offersWithMatches,
      },
      offersByStatus: offersByStatusRaw.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
      transactionsByStatus: transactionsByStatusRaw.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
      listingsByStatus: listingsByStatusRaw.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
      matchesByStatus: matchesByStatusRaw.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
      usersByRole: usersByRoleRaw.map((row) => ({
        role: row.role,
        count: row._count._all,
      })),
      buyersByType: buyersByTypeRaw.map((row) => ({
        buyerType: row.buyerType,
        count: row._count._all,
      })),
      newUsersLast7Days,
      newUsersLast30Days,
      averageMatchScore: averageMatchScoreAgg._avg.score
        ? Math.round(averageMatchScoreAgg._avg.score * 10) / 10
        : 0,
      matchScoreDistribution: Array.from(scoreBuckets.entries()).map(([bucket, count]) => ({
        bucket,
        count,
      })),
      ratingsSummary: {
        totalRatings: ratingsAggregate._count.score,
        averageScore: ratingsAggregate._avg.score
          ? Math.round(ratingsAggregate._avg.score * 10) / 10
          : 0,
        farmerAverageScore: farmerRatings._avg.score
          ? Math.round(farmerRatings._avg.score * 10) / 10
          : 0,
        buyerAverageScore: buyerRatings._avg.score
          ? Math.round(buyerRatings._avg.score * 10) / 10
          : 0,
      },
      weeklyComparison: {
        listingsThisWeek,
        listingsLastWeek,
        offersThisWeek,
        offersLastWeek,
        transactionsThisWeek,
        transactionsLastWeek,
        gmvThisWeek: decimalToNumber(gmvThisWeek._sum.totalAmount) ?? 0,
        gmvLastWeek: decimalToNumber(gmvLastWeek._sum.totalAmount) ?? 0,
      },
      listingsByCategory: listingsByCategoryRaw
        .map((row) => ({
          categoryId: row.categoryId,
          category: categoryName.get(row.categoryId) ?? 'Unknown',
          count: row._count._all,
        }))
        .sort((a, b) => b.count - a.count),
      listingsByRegion: listingsByRegionRaw
        .map((row) => ({ region: row.region, count: row._count._all }))
        .sort((a, b) => b.count - a.count),
      totals: {
        listings: totalListings,
        matches: totalMatches,
        offers: totalOffers,
        transactions: totalTransactionCount,
      },
    };
  }
}

export const dashboardService = new DashboardService();
