import {
  type Prisma,
  ListingStatus,
  MatchStatus,
  NotificationType,
  OfferStatus,
  TransactionStatus,
} from '@prisma/client';
import { prisma } from '../../config/database';
import { logger } from '../../config/logger';
import { ApiError } from '../../utils/api-error';
import { decimalToNumber, multiplyMoney } from '../../utils/money';
import { buyersService } from '../buyers/buyers.service';
import { farmersService } from '../farmers/farmers.service';
import { notificationService } from '../../services/notification.service';
import { recordAudit } from '../../services/audit.service';
import { serializeOffer, serializeTransaction } from './offers.serializer';
import { type CreateOfferInput, type OfferListQuery } from './offers.schema';

const offerInclude = {
  listing: {
    select: { id: true, title: true, unit: true, status: true, farmerId: true },
  },
  buyer: { select: { id: true, businessName: true } },
} satisfies Prisma.OfferInclude;

export class OffersService {
  async createOffer(userId: string, input: CreateOfferInput) {
    const buyerId = await buyersService.requireProfileId(userId);

    const listing = await prisma.produceListing.findUnique({
      where: { id: input.listingId },
      include: { farmer: { select: { id: true, userId: true } } },
    });

    if (!listing) throw ApiError.notFound('Listing not found');
    if (listing.farmer.userId === userId) {
      throw ApiError.forbidden('You cannot make an offer on your own listing');
    }
    if (
      listing.status !== ListingStatus.PUBLISHED &&
      listing.status !== ListingStatus.PARTIALLY_RESERVED
    ) {
      throw ApiError.conflict('This listing is not open for offers');
    }

    const available =
      (decimalToNumber(listing.quantity) ?? 0) - (decimalToNumber(listing.reservedQuantity) ?? 0);
    if (input.offeredQuantity > available) {
      throw ApiError.badRequest(
        `Offered quantity exceeds the available quantity (${available} ${listing.unit})`,
      );
    }

    const totalAmount = multiplyMoney(input.offeredPricePerUnit, input.offeredQuantity);

    const offer = await prisma.offer.create({
      data: {
        listingId: listing.id,
        buyerId,
        offeredQuantity: input.offeredQuantity,
        unit: listing.unit,
        offeredPricePerUnit: input.offeredPricePerUnit,
        totalAmount,
        message: input.message,
        proposedPickupDate: input.proposedPickupDate,
        expiresAt: input.expiresAt,
        status: OfferStatus.PENDING,
      },
      include: offerInclude,
    });

    // Reflect interest on the recommendation, if one exists.
    await prisma.matchRecommendation.updateMany({
      where: { listingId: listing.id, buyerId, status: { in: [MatchStatus.RECOMMENDED, MatchStatus.VIEWED] } },
      data: { status: MatchStatus.OFFERED },
    });

    await notificationService.create({
      userId: listing.farmer.userId,
      type: NotificationType.OFFER_RECEIVED,
      title: 'New offer received',
      message: `You received an offer for "${listing.title}".`,
      metadata: { offerId: offer.id, listingId: listing.id },
    });
    await recordAudit({
      actorUserId: userId,
      action: 'OFFER_CREATED',
      entityType: 'Offer',
      entityId: offer.id,
    });
    logger.info({ offerId: offer.id, listingId: listing.id }, 'Offer created');

    return serializeOffer(offer);
  }

  async listBuyerOffers(userId: string, query: OfferListQuery) {
    const buyerId = await buyersService.requireProfileId(userId);
    const where = this.buildOfferWhere({ buyerId }, query.status);
    return this.paginateOffers(where, query);
  }

  async getBuyerOffer(userId: string, offerId: string) {
    const buyerId = await buyersService.requireProfileId(userId);
    const offer = await prisma.offer.findUnique({ where: { id: offerId }, include: offerInclude });
    if (!offer || offer.buyerId !== buyerId) throw ApiError.notFound('Offer not found');
    return serializeOffer(offer);
  }

  async cancelOffer(userId: string, offerId: string) {
    const buyerId = await buyersService.requireProfileId(userId);
    const offer = await prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer || offer.buyerId !== buyerId) throw ApiError.notFound('Offer not found');
    if (offer.status !== OfferStatus.PENDING) {
      throw ApiError.conflict('Only pending offers can be cancelled');
    }
    const updated = await prisma.offer.update({
      where: { id: offerId },
      data: { status: OfferStatus.CANCELLED, cancelledAt: new Date() },
      include: offerInclude,
    });
    await recordAudit({
      actorUserId: userId,
      action: 'OFFER_CANCELLED',
      entityType: 'Offer',
      entityId: offerId,
    });
    return serializeOffer(updated);
  }

  async listFarmerOffers(userId: string, query: OfferListQuery) {
    const farmerId = await farmersService.requireProfileId(userId);
    const where = this.buildOfferWhere({ listing: { farmerId } }, query.status);
    return this.paginateOffers(where, query);
  }

  async getFarmerOffer(userId: string, offerId: string) {
    const farmerId = await farmersService.requireProfileId(userId);
    const offer = await prisma.offer.findUnique({ where: { id: offerId }, include: offerInclude });
    if (!offer || offer.listing.farmerId !== farmerId) throw ApiError.notFound('Offer not found');
    return serializeOffer(offer);
  }

  async rejectOffer(userId: string, offerId: string) {
    const farmerId = await farmersService.requireProfileId(userId);
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { listing: { select: { farmerId: true, title: true } }, buyer: { select: { userId: true } } },
    });
    if (!offer || offer.listing.farmerId !== farmerId) throw ApiError.notFound('Offer not found');
    if (offer.status !== OfferStatus.PENDING) {
      throw ApiError.conflict('Only pending offers can be rejected');
    }
    const updated = await prisma.offer.update({
      where: { id: offerId },
      data: { status: OfferStatus.REJECTED, rejectedAt: new Date() },
      include: offerInclude,
    });
    await notificationService.create({
      userId: offer.buyer.userId,
      type: NotificationType.OFFER_REJECTED,
      title: 'Offer declined',
      message: `Your offer for "${offer.listing.title}" was declined.`,
      metadata: { offerId },
    });
    await recordAudit({
      actorUserId: userId,
      action: 'OFFER_REJECTED',
      entityType: 'Offer',
      entityId: offerId,
    });
    return serializeOffer(updated);
  }

  // Accept an offer atomically: guards against double-acceptance and over-reservation.
  async acceptOffer(userId: string, offerId: string) {
    const farmerId = await farmersService.requireProfileId(userId);

    const result = await prisma.$transaction(async (tx) => {
      const offer = await tx.offer.findUnique({
        where: { id: offerId },
        include: {
          listing: { select: { id: true, farmerId: true, quantity: true, reservedQuantity: true, title: true } },
          buyer: { select: { id: true, userId: true } },
        },
      });

      if (!offer || offer.listing.farmerId !== farmerId) {
        throw ApiError.notFound('Offer not found');
      }
      if (offer.status !== OfferStatus.PENDING) {
        throw ApiError.conflict('Only pending offers can be accepted');
      }
      if (offer.expiresAt && offer.expiresAt.getTime() < Date.now()) {
        throw ApiError.conflict('This offer has expired and can no longer be accepted');
      }

      const quantity = decimalToNumber(offer.listing.quantity) ?? 0;
      const reserved = decimalToNumber(offer.listing.reservedQuantity) ?? 0;
      const offered = decimalToNumber(offer.offeredQuantity) ?? 0;
      const available = quantity - reserved;

      if (offered > available) {
        throw ApiError.conflict(
          `Insufficient quantity available (${available}) to accept this offer (${offered})`,
        );
      }

      // Guarded update prevents two concurrent accepts from both succeeding.
      const claimed = await tx.offer.updateMany({
        where: { id: offerId, status: OfferStatus.PENDING },
        data: { status: OfferStatus.ACCEPTED, acceptedAt: new Date() },
      });
      if (claimed.count === 0) {
        throw ApiError.conflict('This offer has already been processed');
      }

      const newReserved = reserved + offered;
      const fullyReserved = newReserved >= quantity;
      const newStatus = fullyReserved ? ListingStatus.RESERVED : ListingStatus.PARTIALLY_RESERVED;

      await tx.produceListing.update({
        where: { id: offer.listing.id },
        data: { reservedQuantity: newReserved, status: newStatus },
      });

      const transaction = await tx.produceTransaction.create({
        data: {
          offerId: offer.id,
          listingId: offer.listing.id,
          farmerId,
          buyerId: offer.buyer.id,
          agreedQuantity: offer.offeredQuantity,
          unit: offer.unit,
          agreedPricePerUnit: offer.offeredPricePerUnit,
          totalAmount: offer.totalAmount,
          pickupDate: offer.proposedPickupDate,
          status: TransactionStatus.CONFIRMED,
        },
      });

      await tx.matchRecommendation.updateMany({
        where: { listingId: offer.listing.id, buyerId: offer.buyer.id },
        data: { status: MatchStatus.CONVERTED },
      });

      // If the listing is now fully reserved, decline remaining pending offers.
      const rejectedBuyers: string[] = [];
      if (fullyReserved) {
        const remaining = await tx.offer.findMany({
          where: { listingId: offer.listing.id, status: OfferStatus.PENDING },
          include: { buyer: { select: { userId: true } } },
        });
        if (remaining.length > 0) {
          await tx.offer.updateMany({
            where: { listingId: offer.listing.id, status: OfferStatus.PENDING },
            data: { status: OfferStatus.REJECTED, rejectedAt: new Date() },
          });
          for (const other of remaining) rejectedBuyers.push(other.buyer.userId);
        }
      }

      await notificationService.create(
        {
          userId: offer.buyer.userId,
          type: NotificationType.OFFER_ACCEPTED,
          title: 'Offer accepted',
          message: `Your offer for "${offer.listing.title}" was accepted. A transaction has been created.`,
          metadata: { offerId, transactionId: transaction.id },
        },
        tx,
      );

      for (const buyerUserId of rejectedBuyers) {
        await notificationService.create(
          {
            userId: buyerUserId,
            type: NotificationType.OFFER_REJECTED,
            title: 'Offer declined',
            message: `The listing "${offer.listing.title}" is no longer available.`,
            metadata: { listingId: offer.listing.id },
          },
          tx,
        );
      }

      await recordAudit(
        {
          actorUserId: userId,
          action: 'OFFER_ACCEPTED',
          entityType: 'Offer',
          entityId: offerId,
          metadata: { transactionId: transaction.id, listingId: offer.listing.id },
        },
        tx,
      );

      return { offerId, transaction };
    });

    logger.info({ offerId, transactionId: result.transaction.id }, 'Offer accepted');
    return { offerId: result.offerId, transaction: serializeTransaction(result.transaction) };
  }

  async listBuyerTransactions(userId: string) {
    const buyerId = await buyersService.requireProfileId(userId);
    const items = await prisma.produceTransaction.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      include: { listing: { select: { id: true, title: true } } },
    });
    return items.map(serializeTransaction);
  }

  async getBuyerTransaction(userId: string, transactionId: string) {
    const buyerId = await buyersService.requireProfileId(userId);
    const tx = await prisma.produceTransaction.findUnique({
      where: { id: transactionId },
      include: { listing: { select: { id: true, title: true } } },
    });
    if (!tx || tx.buyerId !== buyerId) throw ApiError.notFound('Transaction not found');
    return serializeTransaction(tx);
  }

  async listFarmerTransactions(userId: string) {
    const farmerId = await farmersService.requireProfileId(userId);
    const items = await prisma.produceTransaction.findMany({
      where: { farmerId },
      orderBy: { createdAt: 'desc' },
      include: { listing: { select: { id: true, title: true } } },
    });
    return items.map(serializeTransaction);
  }

  async getFarmerTransaction(userId: string, transactionId: string) {
    const farmerId = await farmersService.requireProfileId(userId);
    const tx = await prisma.produceTransaction.findUnique({
      where: { id: transactionId },
      include: { listing: { select: { id: true, title: true } } },
    });
    if (!tx || tx.farmerId !== farmerId) throw ApiError.notFound('Transaction not found');
    return serializeTransaction(tx);
  }

  private buildOfferWhere(
    base: Prisma.OfferWhereInput,
    status?: string,
  ): Prisma.OfferWhereInput {
    if (status) {
      const key = status.toUpperCase();
      if (key in OfferStatus) {
        return { ...base, status: key as OfferStatus };
      }
    }
    return base;
  }

  private async paginateOffers(where: Prisma.OfferWhereInput, query: OfferListQuery) {
    const [items, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        include: offerInclude,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.offer.count({ where }),
    ]);
    return { items: items.map(serializeOffer), total };
  }
}

export const offersService = new OffersService();
