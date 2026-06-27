import { describe, it, expect, vi, beforeEach } from 'vitest';
import { localExtractionProvider } from '../../src/services/ai/local-provider';
import { aiExtractionService } from '../../src/services/ai-extraction.service';
import { extractionResultSchema } from '../../src/services/ai/extraction.schema';

describe('Local AI extraction', () => {
  it('extracts tomatoes, quantity, unit, location and relative date from a sentence', async () => {
    const result = extractionResultSchema.parse(
      await localExtractionProvider.extract({
        text: 'I have 60 crates of tomatoes ready next Monday at Agogo',
        referenceDate: '2026-06-26',
      }),
    );

    expect(result.produceName).toBe('Tomatoes');
    expect(result.categorySlug).toBe('tomatoes');
    expect(result.quantity).toBe(60);
    expect(result.unit).toBe('CRATE');
    expect(result.location.town).toBe('Agogo');
    expect(result.location.region).toBe('Ashanti');
    expect(result.harvestDate).toBe('2026-06-29');
    expect(result.availableFrom).toBe('2026-06-29');
  });

  it('returns missing fields for incomplete descriptions', async () => {
    const result = extractionResultSchema.parse(
      await localExtractionProvider.extract({
        text: 'I have tomatoes',
        referenceDate: '2026-06-26',
      }),
    );

    expect(result.missingFields).toContain('quantity');
    expect(result.missingFields).toContain('unit');
    expect(result.clarificationQuestions.length).toBeGreaterThan(0);
  });

  it('validates extraction output against the strict schema', async () => {
    const raw = await localExtractionProvider.extract({
      text: '50 bags of onions in Kumasi tomorrow at GHS 120 per bag',
      referenceDate: '2026-06-26',
    });
    expect(() => extractionResultSchema.parse(raw)).not.toThrow();
  });
});

describe('AIExtractionService fallback', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('falls back to local provider when external provider fails', async () => {
    const result = await aiExtractionService.extract({
      text: '40 crates of plantain ready Friday in Techiman',
      referenceDate: '2026-06-26',
    });
    expect(result.produceName).toBe('Plantain');
    expect(result.quantity).toBe(40);
  });

  it('rejects invalid extraction output', () => {
    expect(() =>
      extractionResultSchema.parse({
        produceName: 'Tomatoes',
        categorySlug: 'tomatoes',
        quantity: -5,
        unit: 'CRATE',
        location: { town: null, district: null, region: null, latitude: null, longitude: null },
        harvestDate: null,
        availableFrom: null,
        pricePerUnit: null,
        minimumOrderQuantity: null,
        confidence: 0.5,
        missingFields: [],
        clarificationQuestions: [],
      }),
    ).toThrow();
  });
});
