import { type MatchRecommendation, NotificationType } from '@prisma/client';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { haversineDistanceKm } from '../utils/distance';
import { decimalToNumber } from '../utils/money';
import {
  MAX_RECOMMENDATIONS_PER_LISTING,
  MIN_RECOMMENDATION_SCORE,
} from '../constants/matching';
import {
  buildExplanation,
  computeScore,
  type DemandSnapshot,
  type ScoreInput,
} from './matching/scoring';
import { notificationService } from './notification.service';

export class MatchingEngineService {
  // Ranks active buyers for a listing, persists recommendations (idempotently via
  // the unique [listingId, buyerId] constraint) and notifies newly matched buyers.
  async generateMatchesForListing(listingId: string): Promise<MatchRecommendation[]> {
    const listing = await prisma.produceListing.findUnique({
      where: { id: listingId },
      include: { category: true },
    });

    if (!listing) {
      logger.warn({ listingId }, 'Cannot generate matches: listing not found');
      return [];
    }

    const availableQuantity =
      (decimalToNumber(listing.quantity) ?? 0) - (decimalToNumber(listing.reservedQuantity) ?? 0);

    // Candidate buyers: those with an active demand for the category OR who list
    // the produce among their preferences. Keeps the scan relevant and bounded.
    const candidates = await prisma.buyerProfile.findMany({
      where: {
        user: { accountStatus: 'ACTIVE' },
        OR: [
          { demands: { some: { categoryId: listing.categoryId, isActive: true } } },
          { preferredProduce: { has: listing.category.slug } },
        ],
      },
      include: {
        user: { select: { id: true } },
        demands: {
          where: { categoryId: listing.categoryId, isActive: true },
          take: 1,
        },
      },
    });

    const existing = await prisma.matchRecommendation.findMany({
      where: { listingId },
      select: { buyerId: true },
    });
    const existingBuyerIds = new Set(existing.map((rec) => rec.buyerId));

    const scored = candidates.map((buyer) => {
      const demand = buyer.demands[0] ?? null;
      const demandSnapshot: DemandSnapshot | null = demand
        ? {
            minimumQuantity: decimalToNumber(demand.minimumQuantity) ?? 0,
            maximumQuantity: decimalToNumber(demand.maximumQuantity),
            preferredPriceMaximum: decimalToNumber(demand.preferredPriceMaximum),
            requiredFrom: demand.requiredFrom,
            requiredUntil: demand.requiredUntil,
          }
        : null;

      const distanceKm = haversineDistanceKm(
        { latitude: listing.latitude, longitude: listing.longitude },
        { latitude: buyer.latitude, longitude: buyer.longitude },
      );

      const scoreInput: ScoreInput = {
        hasActiveDemand: Boolean(demand),
        isPreferredProduce: buyer.preferredProduce.includes(listing.category.slug),
        availableQuantity,
        buyerMinimumOrderQuantity: decimalToNumber(buyer.minimumOrderQuantity),
        demand: demandSnapshot,
        distanceKm,
        maxTravelDistanceKm: buyer.maximumTravelDistanceKm,
        availableFrom: listing.availableFrom,
        availableUntil: listing.availableUntil,
        listingPricePerUnit: decimalToNumber(listing.pricePerUnit),
      };

      const result = computeScore(scoreInput);

      const priceWithinBudget =
        scoreInput.listingPricePerUnit === null || demandSnapshot?.preferredPriceMaximum == null
          ? null
          : scoreInput.listingPricePerUnit <= demandSnapshot.preferredPriceMaximum;

      const explanation = buildExplanation({
        produceName: listing.category.name,
        hasActiveDemand: Boolean(demand),
        isPreferredProduce: scoreInput.isPreferredProduce,
        demandRange: demandSnapshot
          ? {
              min: demandSnapshot.minimumQuantity,
              max: demandSnapshot.maximumQuantity,
              unit: demand?.unit ?? listing.unit,
            }
          : null,
        distanceKm,
        withinDateWindow: result.dateScore >= 80,
        priceWithinBudget,
      });

      return { buyer, result, explanation };
    });

    const qualifying = scored
      .filter((entry) => entry.result.score >= MIN_RECOMMENDATION_SCORE)
      .sort((a, b) => b.result.score - a.result.score)
      .slice(0, MAX_RECOMMENDATIONS_PER_LISTING);

    const persisted: MatchRecommendation[] = [];

    for (const entry of qualifying) {
      const rec = await prisma.matchRecommendation.upsert({
        where: { listingId_buyerId: { listingId, buyerId: entry.buyer.id } },
        update: {
          score: entry.result.score,
          produceScore: entry.result.produceScore,
          quantityScore: entry.result.quantityScore,
          distanceScore: entry.result.distanceScore,
          dateScore: entry.result.dateScore,
          priceScore: entry.result.priceScore,
          explanation: entry.explanation,
          generatedAt: new Date(),
        },
        create: {
          listingId,
          buyerId: entry.buyer.id,
          score: entry.result.score,
          produceScore: entry.result.produceScore,
          quantityScore: entry.result.quantityScore,
          distanceScore: entry.result.distanceScore,
          dateScore: entry.result.dateScore,
          priceScore: entry.result.priceScore,
          explanation: entry.explanation,
        },
      });
      persisted.push(rec);

      if (!existingBuyerIds.has(entry.buyer.id)) {
        await notificationService.create({
          userId: entry.buyer.user.id,
          type: NotificationType.MATCH_FOUND,
          title: 'New produce match found',
          message: `A new ${listing.category.name.toLowerCase()} listing matches your demand (match score ${entry.result.score}).`,
          metadata: { listingId, recommendationId: rec.id, score: entry.result.score },
        });
      }
    }

    logger.info(
      { listingId, candidates: candidates.length, persisted: persisted.length },
      'Match generation complete',
    );

    return persisted;
  }
}

export const matchingEngineService = new MatchingEngineService();
