import { MATCH_WEIGHTS, DISTANCE_SCORE_BANDS, NEUTRAL_SCORE } from '../../constants/matching';

export interface DemandSnapshot {
  minimumQuantity: number;
  maximumQuantity: number | null;
  preferredPriceMaximum: number | null;
  requiredFrom: Date | null;
  requiredUntil: Date | null;
}

export interface ScoreInput {
  // Produce
  hasActiveDemand: boolean;
  isPreferredProduce: boolean;
  // Quantity
  availableQuantity: number;
  buyerMinimumOrderQuantity: number | null;
  demand: DemandSnapshot | null;
  // Distance
  distanceKm: number;
  maxTravelDistanceKm: number;
  // Date
  availableFrom: Date;
  availableUntil: Date | null;
  // Price
  listingPricePerUnit: number | null;
}

export interface DimensionScores {
  produceScore: number;
  quantityScore: number;
  distanceScore: number;
  dateScore: number;
  priceScore: number;
}

export interface ScoreResult extends DimensionScores {
  score: number;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function produceScore(input: ScoreInput): number {
  if (input.hasActiveDemand) return 100;
  if (input.isPreferredProduce) return 70;
  return 0;
}

export function quantityScore(input: ScoreInput): number {
  const { availableQuantity, demand, buyerMinimumOrderQuantity } = input;

  if (demand) {
    const { minimumQuantity, maximumQuantity } = demand;
    if (availableQuantity >= minimumQuantity) {
      if (maximumQuantity === null || availableQuantity <= maximumQuantity) return 100;
      // More than the buyer wants — still very usable (partial purchase possible).
      return 85;
    }
    // Less than required minimum: scale proportionally.
    return clamp((availableQuantity / minimumQuantity) * 90);
  }

  if (buyerMinimumOrderQuantity !== null) {
    return availableQuantity >= buyerMinimumOrderQuantity ? 80 : 50;
  }

  return NEUTRAL_SCORE;
}

export function distanceScore(input: ScoreInput): number {
  if (input.distanceKm > input.maxTravelDistanceKm) return 0;
  for (const band of DISTANCE_SCORE_BANDS) {
    if (input.distanceKm <= band.maxKm) return band.score;
  }
  return 0;
}

export function dateScore(input: ScoreInput): number {
  const { demand, availableFrom, availableUntil } = input;
  if (!demand || (!demand.requiredFrom && !demand.requiredUntil)) {
    return NEUTRAL_SCORE;
  }

  const reqFrom = demand.requiredFrom ?? new Date(-8640000000000000);
  const reqUntil = demand.requiredUntil ?? new Date(8640000000000000);
  const availUntil = availableUntil ?? new Date(8640000000000000);

  // Overlap between [availableFrom, availUntil] and [reqFrom, reqUntil].
  const overlaps = availableFrom <= reqUntil && availUntil >= reqFrom;
  if (overlaps) return 100;

  // No overlap: penalise by how far the listing starts after the required window.
  const gapMs = availableFrom.getTime() - reqUntil.getTime();
  const gapDays = Math.abs(gapMs) / (1000 * 60 * 60 * 24);
  return clamp(80 - gapDays * 5);
}

export function priceScore(input: ScoreInput): number {
  const max = input.demand?.preferredPriceMaximum ?? null;
  if (input.listingPricePerUnit === null || max === null) {
    return NEUTRAL_SCORE;
  }
  if (input.listingPricePerUnit <= max) return 100;
  // Above the buyer's ceiling: degrade based on overshoot.
  return clamp((max / input.listingPricePerUnit) * 100);
}

export function computeScore(input: ScoreInput): ScoreResult {
  const dimensions: DimensionScores = {
    produceScore: produceScore(input),
    quantityScore: quantityScore(input),
    distanceScore: distanceScore(input),
    dateScore: dateScore(input),
    priceScore: priceScore(input),
  };

  const total =
    dimensions.produceScore * MATCH_WEIGHTS.produce +
    dimensions.quantityScore * MATCH_WEIGHTS.quantity +
    dimensions.distanceScore * MATCH_WEIGHTS.distance +
    dimensions.dateScore * MATCH_WEIGHTS.date +
    dimensions.priceScore * MATCH_WEIGHTS.price;

  return { ...dimensions, score: Math.round(total) };
}

export interface ExplanationFacts {
  produceName: string;
  hasActiveDemand: boolean;
  isPreferredProduce: boolean;
  demandRange: { min: number; max: number | null; unit: string } | null;
  distanceKm: number;
  withinDateWindow: boolean;
  priceWithinBudget: boolean | null;
}

export function buildExplanation(facts: ExplanationFacts): string {
  const parts: string[] = [];

  if (facts.hasActiveDemand && facts.demandRange) {
    const range =
      facts.demandRange.max !== null
        ? `${facts.demandRange.min}–${facts.demandRange.max} ${facts.demandRange.unit.toLowerCase()}`
        : `at least ${facts.demandRange.min} ${facts.demandRange.unit.toLowerCase()}`;
    parts.push(`This buyer regularly purchases ${facts.produceName.toLowerCase()} and requires ${range}`);
  } else if (facts.isPreferredProduce) {
    parts.push(`This buyer lists ${facts.produceName.toLowerCase()} among their preferred produce`);
  } else {
    parts.push(`This buyer may be interested in ${facts.produceName.toLowerCase()}`);
  }

  parts.push(`is located ${facts.distanceKm} km away`);

  if (facts.withinDateWindow) {
    parts.push("needs delivery within the listing's availability period");
  }

  if (facts.priceWithinBudget === true) {
    parts.push('and the asking price fits their budget');
  } else if (facts.priceWithinBudget === false) {
    parts.push('though the asking price is above their usual budget');
  }

  return `${parts.join(', ')}.`;
}
