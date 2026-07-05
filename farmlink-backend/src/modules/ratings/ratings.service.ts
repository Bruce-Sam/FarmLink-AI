import { RatedRole, TransactionStatus, type PartnerRating } from '@prisma/client';
import { prisma } from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { type CreateRatingInput } from './ratings.schema';

const RATEABLE_STATUSES: TransactionStatus[] = [
  TransactionStatus.DELIVERED,
  TransactionStatus.COMPLETED,
];

function serializeRating(rating: PartnerRating & { rater?: { fullName: string } }) {
  return {
    id: rating.id,
    transactionId: rating.transactionId,
    raterUserId: rating.raterUserId,
    raterName: rating.rater?.fullName,
    ratedUserId: rating.ratedUserId,
    ratedRole: rating.ratedRole.toLowerCase(),
    score: rating.score,
    comment: rating.comment,
    createdAt: rating.createdAt.toISOString(),
  };
}

export class RatingsService {
  async createRating(raterUserId: string, input: CreateRatingInput) {
    const transaction = await prisma.produceTransaction.findUnique({
      where: { id: input.transactionId },
      include: {
        listing: {
          include: {
            farmer: { select: { id: true, userId: true, farmName: true } },
          },
        },
        buyer: { select: { id: true, userId: true, businessName: true } },
      },
    });

    if (!transaction) {
      throw ApiError.notFound('Transaction not found');
    }

    if (!RATEABLE_STATUSES.includes(transaction.status)) {
      throw ApiError.badRequest('You can only rate partners after delivery or completion');
    }

    const farmerUserId = transaction.listing.farmer.userId;
    const buyerUserId = transaction.buyer.userId;

    const targetRole = input.targetRole === 'farmer' ? RatedRole.FARMER : RatedRole.BUYER;
    const ratedUserId = targetRole === RatedRole.FARMER ? farmerUserId : buyerUserId;

    const isFarmerRater =
      raterUserId === farmerUserId && transaction.listing.farmer.id === transaction.farmerId;
    const isBuyerRater =
      raterUserId === buyerUserId && transaction.buyer.id === transaction.buyerId;

    if (targetRole === RatedRole.BUYER && !isFarmerRater) {
      throw ApiError.forbidden('Only the farmer on this transaction can rate the buyer');
    }
    if (targetRole === RatedRole.FARMER && !isBuyerRater) {
      throw ApiError.forbidden('Only the buyer on this transaction can rate the farmer');
    }

    const existing = await prisma.partnerRating.findUnique({
      where: {
        transactionId_raterUserId: {
          transactionId: input.transactionId,
          raterUserId,
        },
      },
    });
    if (existing) {
      throw ApiError.conflict('You have already rated this transaction');
    }

    const rating = await prisma.partnerRating.create({
      data: {
        transactionId: input.transactionId,
        raterUserId,
        ratedUserId,
        ratedRole: targetRole,
        score: input.score,
        comment: input.comment,
      },
      include: { rater: { select: { fullName: true } } },
    });

    return serializeRating(rating);
  }

  async getUserSummary(userId: string) {
    const [aggregate, recent] = await Promise.all([
      prisma.partnerRating.aggregate({
        where: { ratedUserId: userId },
        _avg: { score: true },
        _count: { score: true },
      }),
      prisma.partnerRating.findMany({
        where: { ratedUserId: userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { rater: { select: { fullName: true } } },
      }),
    ]);

    return {
      averageScore: aggregate._avg.score ?? 0,
      totalRatings: aggregate._count.score,
      recentRatings: recent.map(serializeRating),
    };
  }

  async getFarmerProfileSummary(farmerProfileId: string) {
    const profile = await prisma.farmerProfile.findUnique({
      where: { id: farmerProfileId },
      select: { userId: true },
    });
    if (!profile) throw ApiError.notFound('Farmer not found');
    return this.getUserSummary(profile.userId);
  }

  async getBuyerProfileSummary(buyerProfileId: string) {
    const profile = await prisma.buyerProfile.findUnique({
      where: { id: buyerProfileId },
      select: { userId: true },
    });
    if (!profile) throw ApiError.notFound('Buyer not found');
    return this.getUserSummary(profile.userId);
  }

  async getTransactionRatings(userId: string, transactionId: string) {
    const transaction = await prisma.produceTransaction.findUnique({
      where: { id: transactionId },
      include: {
        listing: { include: { farmer: { select: { userId: true } } } },
        buyer: { select: { userId: true } },
        ratings: {
          include: { rater: { select: { fullName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!transaction) throw ApiError.notFound('Transaction not found');

    const farmerUserId = transaction.listing.farmer.userId;
    const buyerUserId = transaction.buyer.userId;
    const isParticipant = userId === farmerUserId || userId === buyerUserId;
    if (!isParticipant) {
      throw ApiError.forbidden('You are not part of this transaction');
    }

    const myRating = transaction.ratings.find((rating) => rating.raterUserId === userId);

    return {
      ratings: transaction.ratings.map(serializeRating),
      myRating: myRating ? serializeRating(myRating) : null,
      canRate: RATEABLE_STATUSES.includes(transaction.status) && !myRating,
      targetRole: userId === farmerUserId ? 'buyer' : 'farmer',
    };
  }
}

export const ratingsService = new RatingsService();
