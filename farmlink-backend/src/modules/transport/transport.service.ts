import { type TransportPoolSuggestion, ListingStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { logger } from '../../config/logger';
import { haversineDistanceKm } from '../../utils/distance';
import {
  TRANSPORT_POOL_DATE_WINDOW_DAYS,
  TRANSPORT_POOL_RADIUS_KM,
} from '../../constants/matching';
import { farmersService } from '../farmers/farmers.service';

const DAY_MS = 1000 * 60 * 60 * 24;

export class TransportService {
  // Suggests pooling produce transport with nearby farmers harvesting around the
  // same time. Approximate by design — this is a recommendation, not logistics.
  async generateForListing(listingId: string): Promise<TransportPoolSuggestion[]> {
    const listing = await prisma.produceListing.findUnique({
      where: { id: listingId },
      include: { category: { select: { name: true, slug: true } } },
    });
    if (!listing) return [];

    const windowMs = TRANSPORT_POOL_DATE_WINDOW_DAYS * DAY_MS;
    const others = await prisma.produceListing.findMany({
      where: {
        id: { not: listingId },
        farmerId: { not: listing.farmerId },
        status: { in: [ListingStatus.PUBLISHED, ListingStatus.PARTIALLY_RESERVED] },
        availableFrom: {
          gte: new Date(listing.availableFrom.getTime() - windowMs),
          lte: new Date(listing.availableFrom.getTime() + windowMs),
        },
      },
      include: { category: { select: { name: true, slug: true } } },
      take: 100,
    });

    const created: TransportPoolSuggestion[] = [];

    for (const other of others) {
      const distanceKm = haversineDistanceKm(
        { latitude: listing.latitude, longitude: listing.longitude },
        { latitude: other.latitude, longitude: other.longitude },
      );
      if (distanceKm > TRANSPORT_POOL_RADIUS_KM) continue;

      const sameCategory = other.categoryId === listing.categoryId;
      const sameRegion = other.region.toLowerCase() === listing.region.toLowerCase();
      const destinationSimilarityScore =
        Math.round(((sameCategory ? 0.6 : 0.2) + (sameRegion ? 0.4 : 0)) * 100) / 100;

      const estimatedSavingsPercentage = sameCategory
        ? Math.max(0, Math.round((25 - distanceKm) * 10) / 10)
        : null;

      const explanation =
        `Another ${other.category.name.toLowerCase()} farmer is located ${distanceKm} km away ` +
        `with produce scheduled around the same time. Combining transport may reduce delivery costs.`;

      const suggestion = await prisma.transportPoolSuggestion.upsert({
        where: {
          primaryListingId_secondaryListingId: {
            primaryListingId: listingId,
            secondaryListingId: other.id,
          },
        },
        update: { distanceBetweenFarmsKm: distanceKm, destinationSimilarityScore, explanation },
        create: {
          primaryListingId: listingId,
          secondaryListingId: other.id,
          distanceBetweenFarmsKm: distanceKm,
          destinationSimilarityScore,
          estimatedSavingsPercentage,
          explanation,
        },
      });
      created.push(suggestion);
    }

    logger.info({ listingId, suggestions: created.length }, 'Transport suggestions generated');
    return created;
  }

  async listForFarmer(userId: string) {
    const farmerId = await farmersService.requireProfileId(userId);
    return prisma.transportPoolSuggestion.findMany({
      where: {
        OR: [
          { primaryListing: { farmerId } },
          { secondaryListing: { farmerId } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        primaryListing: { select: { id: true, title: true, town: true, farmerId: true } },
        secondaryListing: { select: { id: true, title: true, town: true, farmerId: true } },
      },
    });
  }
}

export const transportService = new TransportService();
