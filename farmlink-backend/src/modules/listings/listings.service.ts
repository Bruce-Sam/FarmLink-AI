import { type Prisma, ListingStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { logger } from '../../config/logger';
import { ApiError } from '../../utils/api-error';
import { haversineDistanceKm } from '../../utils/distance';
import { farmersService } from '../farmers/farmers.service';
import { aiExtractionService } from '../../services/ai-extraction.service';
import { matchingEngineService } from '../../services/matching-engine.service';
import { transportService } from '../transport/transport.service';
import { recordAudit } from '../../services/audit.service';
import { serializeListing, type SerializedListing } from './listings.serializer';
import {
  type CreateListingInput,
  type ExtractRequest,
  type MarketplaceQuery,
  type MyListingsQuery,
  type UpdateListingInput,
} from './listings.schema';

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

const EDITABLE_STATUSES: ListingStatus[] = [ListingStatus.DRAFT, ListingStatus.PUBLISHED];
const TERMINAL_STATUSES: ListingStatus[] = [ListingStatus.SOLD, ListingStatus.CANCELLED];

export class ListingsService {
  async extract(input: ExtractRequest) {
    return aiExtractionService.extract(input);
  }

  private async assertCategory(categoryId: string): Promise<void> {
    const category = await prisma.produceCategory.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!category) throw ApiError.badRequest('Unknown produce category');
  }

  async create(userId: string, input: CreateListingInput): Promise<SerializedListing> {
    const farmerId = await farmersService.requireProfileId(userId);
    await this.assertCategory(input.categoryId);

    const listing = await prisma.produceListing.create({
      data: {
        farmerId,
        categoryId: input.categoryId,
        title: input.title,
        description: input.description,
        quantity: input.quantity,
        unit: input.unit,
        minimumOrderQuantity: input.minimumOrderQuantity,
        pricePerUnit: input.pricePerUnit,
        currency: input.currency,
        harvestDate: input.harvestDate,
        availableFrom: input.availableFrom,
        availableUntil: input.availableUntil,
        qualityGrade: input.qualityGrade,
        farmingMethod: input.farmingMethod,
        region: input.region,
        district: input.district,
        town: input.town,
        latitude: input.latitude,
        longitude: input.longitude,
        sourceType: input.sourceType,
        rawInputText: input.rawInputText,
        aiExtractionConfidence: input.aiExtractionConfidence,
        status: ListingStatus.DRAFT,
      },
      include: listingInclude,
    });

    return serializeListing(listing);
  }

  private async requireOwnedListing(userId: string, listingId: string) {
    const farmerId = await farmersService.requireProfileId(userId);
    const listing = await prisma.produceListing.findUnique({
      where: { id: listingId },
      include: listingInclude,
    });
    if (!listing || listing.farmerId !== farmerId) {
      throw ApiError.notFound('Listing not found');
    }
    return listing;
  }

  async getOwn(userId: string, listingId: string): Promise<SerializedListing> {
    const listing = await this.requireOwnedListing(userId, listingId);
    return serializeListing(listing);
  }

  async update(
    userId: string,
    listingId: string,
    input: UpdateListingInput,
  ): Promise<SerializedListing> {
    const listing = await this.requireOwnedListing(userId, listingId);
    if (!EDITABLE_STATUSES.includes(listing.status)) {
      throw ApiError.conflict(`A ${listing.status.toLowerCase()} listing can no longer be edited`);
    }
    if (input.categoryId) await this.assertCategory(input.categoryId);

    const updated = await prisma.produceListing.update({
      where: { id: listingId },
      data: input,
      include: listingInclude,
    });
    return serializeListing(updated);
  }

  async publish(userId: string, listingId: string) {
    const listing = await this.requireOwnedListing(userId, listingId);
    if (listing.status === ListingStatus.PUBLISHED) {
      throw ApiError.conflict('Listing is already published');
    }
    if (listing.status !== ListingStatus.DRAFT) {
      throw ApiError.conflict(`A ${listing.status.toLowerCase()} listing cannot be published`);
    }

    const published = await prisma.produceListing.update({
      where: { id: listingId },
      data: { status: ListingStatus.PUBLISHED, publishedAt: new Date() },
      include: listingInclude,
    });

    await recordAudit({
      actorUserId: userId,
      action: 'LISTING_PUBLISHED',
      entityType: 'ProduceListing',
      entityId: listingId,
    });
    logger.info({ listingId }, 'Listing published');

    // Generate buyer recommendations immediately after publishing.
    const matches = await matchingEngineService.generateMatchesForListing(listingId);
    // Best-effort transport pooling suggestions (non-critical).
    const transportSuggestions = await transportService.generateForListing(listingId);

    return {
      listing: serializeListing(published),
      matchesGenerated: matches.length,
      transportSuggestionsGenerated: transportSuggestions.length,
    };
  }

  async cancel(userId: string, listingId: string): Promise<SerializedListing> {
    const listing = await this.requireOwnedListing(userId, listingId);
    if (TERMINAL_STATUSES.includes(listing.status)) {
      throw ApiError.conflict(`A ${listing.status.toLowerCase()} listing cannot be cancelled`);
    }
    const cancelled = await prisma.produceListing.update({
      where: { id: listingId },
      data: { status: ListingStatus.CANCELLED },
      include: listingInclude,
    });
    return serializeListing(cancelled);
  }

  async listMy(userId: string, query: MyListingsQuery) {
    const farmerId = await farmersService.requireProfileId(userId);
    const where: Prisma.ProduceListingWhereInput = { farmerId };
    if (query.status) {
      const key = query.status.toUpperCase();
      if (key in ListingStatus) {
        where.status = key as ListingStatus;
      }
    }
    const [items, total] = await Promise.all([
      prisma.produceListing.findMany({
        where,
        include: listingInclude,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.produceListing.count({ where }),
    ]);
    return { items: items.map(serializeListing), total };
  }

  async getMatches(userId: string, listingId: string) {
    await this.requireOwnedListing(userId, listingId);
    return prisma.matchRecommendation.findMany({
      where: { listingId },
      orderBy: { score: 'desc' },
      include: {
        buyer: {
          select: {
            id: true,
            businessName: true,
            buyerType: true,
            region: true,
            town: true,
          },
        },
      },
    });
  }

  async getPublicById(listingId: string): Promise<SerializedListing> {
    const listing = await prisma.produceListing.findFirst({
      where: { id: listingId, status: { in: [ListingStatus.PUBLISHED, ListingStatus.PARTIALLY_RESERVED] } },
      include: listingInclude,
    });
    if (!listing) throw ApiError.notFound('Listing not found or not available');
    return serializeListing(listing);
  }

  // Public marketplace search. Distance filtering/sorting is computed in-memory
  // (no PostGIS dependency) against the requesting buyer's coordinates.
  async marketplace(
    query: MarketplaceQuery,
    buyerCoords: { latitude: number; longitude: number } | null,
  ) {
    const where: Prisma.ProduceListingWhereInput = {
      status: { in: [ListingStatus.PUBLISHED, ListingStatus.PARTIALLY_RESERVED] },
      AND: [{ OR: [{ availableUntil: null }, { availableUntil: { gte: new Date() } }] }],
    };

    if (query.category) where.category = { slug: query.category.toLowerCase() };
    if (query.region) where.region = { equals: query.region, mode: 'insensitive' };
    if (query.district) where.district = { equals: query.district, mode: 'insensitive' };
    if (query.town) where.town = { equals: query.town, mode: 'insensitive' };
    if (query.unit) where.unit = query.unit;
    if (query.minQuantity !== undefined) where.quantity = { gte: query.minQuantity };
    if (query.maxPrice !== undefined) where.pricePerUnit = { lte: query.maxPrice };
    if (query.availableFrom) where.availableFrom = { lte: query.availableFrom };
    if (query.harvestDateFrom || query.harvestDateTo) {
      where.harvestDate = {
        ...(query.harvestDateFrom ? { gte: query.harvestDateFrom } : {}),
        ...(query.harvestDateTo ? { lte: query.harvestDateTo } : {}),
      };
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const maxDistanceKm = query.maxDistanceKm;
    const wantsDistance = query.sort === 'distance' || maxDistanceKm !== undefined;

    if (wantsDistance && buyerCoords) {
      const candidates = await prisma.produceListing.findMany({
        where,
        include: listingInclude,
        take: 500,
      });
      let withDistance = candidates.map((listing) => ({
        listing: serializeListing(listing),
        distanceKm: haversineDistanceKm(buyerCoords, {
          latitude: listing.latitude,
          longitude: listing.longitude,
        }),
      }));
      if (maxDistanceKm !== undefined) {
        withDistance = withDistance.filter((entry) => entry.distanceKm <= maxDistanceKm);
      }
      withDistance.sort((a, b) => a.distanceKm - b.distanceKm);

      const total = withDistance.length;
      const start = (query.page - 1) * query.limit;
      const paged = withDistance
        .slice(start, start + query.limit)
        .map((entry) => ({ ...entry.listing, distanceKm: entry.distanceKm }));
      return { items: paged, total };
    }

    const orderBy = this.resolveOrderBy(query.sort);
    const [items, total] = await Promise.all([
      prisma.produceListing.findMany({
        where,
        include: listingInclude,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.produceListing.count({ where }),
    ]);
    return { items: items.map(serializeListing), total };
  }

  private resolveOrderBy(sort: MarketplaceQuery['sort']): Prisma.ProduceListingOrderByWithRelationInput {
    switch (sort) {
      case 'oldest':
        return { createdAt: 'asc' };
      case 'priceAsc':
        return { pricePerUnit: 'asc' };
      case 'priceDesc':
        return { pricePerUnit: 'desc' };
      case 'harvestDate':
        return { harvestDate: 'asc' };
      case 'newest':
      default:
        return { createdAt: 'desc' };
    }
  }
}

export const listingsService = new ListingsService();
