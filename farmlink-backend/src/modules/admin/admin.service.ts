import {
  type AccountStatus,
  type ListingStatus,
  type Prisma,
  NotificationType,
} from '@prisma/client';
import { prisma } from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { safeUserSelect } from '../users/user.select';
import { serializeListing } from '../listings/listings.serializer';
import { serializeOffer, serializeTransaction } from '../offers/offers.serializer';
import { matchingEngineService } from '../../services/matching-engine.service';
import { notificationService } from '../../services/notification.service';
import { recordAudit } from '../../services/audit.service';
import {
  type AdminGenericQuery,
  type AdminListingsQuery,
  type AdminUsersQuery,
} from './admin.schema';

const listingInclude = {
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
} satisfies Prisma.ProduceListingInclude;

function skipTake(page: number, limit: number) {
  return { skip: (page - 1) * limit, take: limit };
}

export class AdminService {
  async listUsers(query: AdminUsersQuery) {
    const where: Prisma.UserWhereInput = {};
    if (query.role) where.role = query.role;
    if (query.status) where.accountStatus = query.status;
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { phoneNumber: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: safeUserSelect,
        orderBy: { createdAt: 'desc' },
        ...skipTake(query.page, query.limit),
      }),
      prisma.user.count({ where }),
    ]);
    return { items, total };
  }

  async getUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { ...safeUserSelect, farmerProfile: true, buyerProfile: true },
    });
    if (!user) throw ApiError.notFound('User not found');
    return user;
  }

  async updateUserStatus(adminId: string, userId: string, status: AccountStatus) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) throw ApiError.notFound('User not found');

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { accountStatus: status },
      select: safeUserSelect,
    });

    await notificationService.create({
      userId,
      type: NotificationType.ACCOUNT_UPDATE,
      title: 'Account status updated',
      message: `Your account status has been changed to ${status}.`,
      metadata: { status },
    });
    await recordAudit({
      actorUserId: adminId,
      action: 'USER_STATUS_CHANGED',
      entityType: 'User',
      entityId: userId,
      metadata: { status },
    });
    return updated;
  }

  async listListings(query: AdminListingsQuery) {
    const where: Prisma.ProduceListingWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.region) where.region = { equals: query.region, mode: 'insensitive' };
    if (query.category) where.category = { slug: query.category.toLowerCase() };

    const [items, total] = await Promise.all([
      prisma.produceListing.findMany({
        where,
        include: listingInclude,
        orderBy: { createdAt: 'desc' },
        ...skipTake(query.page, query.limit),
      }),
      prisma.produceListing.count({ where }),
    ]);
    return { items: items.map(serializeListing), total };
  }

  async getListing(listingId: string) {
    const listing = await prisma.produceListing.findUnique({
      where: { id: listingId },
      include: listingInclude,
    });
    if (!listing) throw ApiError.notFound('Listing not found');
    return serializeListing(listing);
  }

  async updateListingStatus(adminId: string, listingId: string, status: ListingStatus) {
    const listing = await prisma.produceListing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });
    if (!listing) throw ApiError.notFound('Listing not found');

    const updated = await prisma.produceListing.update({
      where: { id: listingId },
      data: { status },
      include: listingInclude,
    });
    await recordAudit({
      actorUserId: adminId,
      action: 'LISTING_STATUS_CHANGED',
      entityType: 'ProduceListing',
      entityId: listingId,
      metadata: { status },
    });
    return serializeListing(updated);
  }

  async listOffers(query: AdminGenericQuery) {
    const where: Prisma.OfferWhereInput = {};
    if (query.status) {
      where.status = query.status.toUpperCase() as Prisma.OfferWhereInput['status'];
    }
    const [items, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: { select: { id: true, title: true } },
          buyer: { select: { id: true, businessName: true } },
        },
        ...skipTake(query.page, query.limit),
      }),
      prisma.offer.count({ where }),
    ]);
    return { items: items.map(serializeOffer), total };
  }

  async listTransactions(query: AdminGenericQuery) {
    const where: Prisma.ProduceTransactionWhereInput = {};
    if (query.status) {
      where.status = query.status.toUpperCase() as Prisma.ProduceTransactionWhereInput['status'];
    }
    const [items, total] = await Promise.all([
      prisma.produceTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: { select: { id: true, title: true } },
          buyer: { select: { id: true, businessName: true } },
        },
        ...skipTake(query.page, query.limit),
      }),
      prisma.produceTransaction.count({ where }),
    ]);
    return { items: items.map(serializeTransaction), total };
  }

  async listMatches(query: AdminGenericQuery) {
    const [items, total] = await Promise.all([
      prisma.matchRecommendation.findMany({
        orderBy: { score: 'desc' },
        include: {
          listing: { select: { id: true, title: true } },
          buyer: { select: { id: true, businessName: true } },
        },
        ...skipTake(query.page, query.limit),
      }),
      prisma.matchRecommendation.count(),
    ]);
    return { items, total };
  }

  async regenerateMatches(adminId: string, listingId: string) {
    const listing = await prisma.produceListing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });
    if (!listing) throw ApiError.notFound('Listing not found');

    const matches = await matchingEngineService.generateMatchesForListing(listingId);
    await recordAudit({
      actorUserId: adminId,
      action: 'MATCHES_REGENERATED',
      entityType: 'ProduceListing',
      entityId: listingId,
      metadata: { count: matches.length },
    });
    return { matchesGenerated: matches.length };
  }

  async listAuditLogs(query: AdminGenericQuery) {
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        ...skipTake(query.page, query.limit),
      }),
      prisma.auditLog.count(),
    ]);
    return { items, total };
  }
}

export const adminService = new AdminService();
