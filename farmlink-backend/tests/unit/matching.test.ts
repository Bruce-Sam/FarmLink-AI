import { describe, it, expect } from 'vitest';
import {
  computeScore,
  produceScore,
  quantityScore,
  distanceScore,
  buildExplanation,
  type ScoreInput,
} from '../../src/services/matching/scoring';

function baseInput(overrides: Partial<ScoreInput> = {}): ScoreInput {
  return {
    hasActiveDemand: false,
    isPreferredProduce: false,
    availableQuantity: 60,
    buyerMinimumOrderQuantity: null,
    demand: null,
    distanceKm: 32,
    maxTravelDistanceKm: 100,
    availableFrom: new Date('2026-06-29T00:00:00.000Z'),
    availableUntil: new Date('2026-07-05T00:00:00.000Z'),
    listingPricePerUnit: 180,
    ...overrides,
  };
}

describe('Matching scoring', () => {
  it('ranks exact produce demand higher than preference-only match', () => {
    const withDemand = produceScore(baseInput({ hasActiveDemand: true }));
    const withPreference = produceScore(baseInput({ isPreferredProduce: true }));
    expect(withDemand).toBeGreaterThan(withPreference);
  });

  it('scores nearby buyers higher than distant buyers', () => {
    const near = distanceScore(baseInput({ distanceKm: 15, maxTravelDistanceKm: 100 }));
    const far = distanceScore(baseInput({ distanceKm: 150, maxTravelDistanceKm: 100 }));
    expect(near).toBeGreaterThan(far);
    expect(far).toBe(0);
  });

  it('returns zero distance score when buyer is beyond travel limit', () => {
    expect(distanceScore(baseInput({ distanceKm: 120, maxTravelDistanceKm: 100 }))).toBe(0);
  });

  it('returns quantity score when listing meets demand minimum', () => {
    const score = quantityScore(
      baseInput({
        demand: {
          minimumQuantity: 40,
          maximumQuantity: 100,
          preferredPriceMaximum: 200,
          requiredFrom: null,
          requiredUntil: null,
        },
      }),
    );
    expect(score).toBe(100);
  });

  it('computes weighted total score between 0 and 100', () => {
    const result = computeScore(
      baseInput({
        hasActiveDemand: true,
        demand: {
          minimumQuantity: 40,
          maximumQuantity: 100,
          preferredPriceMaximum: 200,
          requiredFrom: new Date('2026-06-28T00:00:00.000Z'),
          requiredUntil: new Date('2026-07-10T00:00:00.000Z'),
        },
      }),
    );
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.produceScore).toBe(100);
  });

  it('returns a human-readable explanation', () => {
    const explanation = buildExplanation({
      produceName: 'Tomatoes',
      hasActiveDemand: true,
      isPreferredProduce: false,
      demandRange: { min: 40, max: 100, unit: 'CRATE' },
      distanceKm: 32,
      withinDateWindow: true,
      priceWithinBudget: true,
    });
    expect(explanation).toContain('tomatoes');
    expect(explanation).toContain('32 km');
  });
});
