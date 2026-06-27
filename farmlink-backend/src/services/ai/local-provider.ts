import { type AIExtractionProvider } from './provider';
import { type ExtractionInput, type ExtractionResult } from './extraction.schema';
import {
  categoryNameFromSlug,
  normalizeProduceName,
  normalizeUnit,
} from '../../constants/produce';
import { detectLocationInText } from '../geolocation.service';

const WEEKDAYS: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function toUtcDate(input?: string): Date {
  if (!input) {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return new Date(`${input}T00:00:00.000Z`);
  }
  const parsed = new Date(input);
  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function nextWeekday(ref: Date, targetDay: number): Date {
  let diff = (targetDay - ref.getUTCDay() + 7) % 7;
  if (diff === 0) diff = 7; // "next Monday" means the upcoming one, not today
  return addDays(ref, diff);
}

function parseRelativeDate(text: string, ref: Date): Date | null {
  const lower = text.toLowerCase();

  const explicit = lower.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (explicit) return toUtcDate(explicit[1]);

  if (/\btoday\b/.test(lower)) return ref;
  if (/\btomorrow\b/.test(lower)) return addDays(ref, 1);

  const inDays = lower.match(/\bin\s+(\d{1,3})\s+days?\b/);
  if (inDays) return addDays(ref, Number(inDays[1]));

  if (/\bnext\s+week\b/.test(lower)) return addDays(ref, 7);
  if (/\bthis\s+weekend\b/.test(lower)) return nextWeekday(ref, WEEKDAYS.saturday);

  const weekdayMatch = lower.match(
    /\b(?:next|on|by|this|coming)?\s*(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/,
  );
  if (weekdayMatch) {
    const day = WEEKDAYS[weekdayMatch[1]];
    return nextWeekday(ref, day);
  }

  return null;
}

function parseQuantityAndUnit(text: string): { quantity: number | null; unit: ReturnType<typeof normalizeUnit> } {
  const match = text.match(
    /(\d+(?:\.\d+)?)\s*(kgs?|kilo(?:gram)?s?|tonnes?|tons?|crates?|bags?|boxe?s?|bunch(?:es)?|pieces?|pcs|baskets?|sacks?)/i,
  );
  if (match) {
    return { quantity: Number(match[1]), unit: normalizeUnit(match[2]) };
  }
  const numberOnly = text.match(/\b(\d+(?:\.\d+)?)\b/);
  return { quantity: numberOnly ? Number(numberOnly[1]) : null, unit: null };
}

function parsePrice(text: string): number | null {
  const patterns: RegExp[] = [
    /(?:ghs|gh¢|₵|cedis?)\s*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:ghs|cedis?)/i,
    /(?:at|for|@)\s*(\d+(?:\.\d+)?)\s*(?:per|each|\/|a\b)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return Number(m[1]);
  }
  return null;
}

function parseMinimumOrder(text: string): number | null {
  const m = text.match(/min(?:imum)?(?:\s+order)?(?:\s+(?:of|quantity))?\s*(\d+(?:\.\d+)?)/i);
  return m ? Number(m[1]) : null;
}

// Deterministic, offline extraction. Handles the common Ghanaian farmer phrases
// the demo relies on without any external API call.
export const localExtractionProvider: AIExtractionProvider = {
  name: 'local',
  async extract(input: ExtractionInput): Promise<ExtractionResult> {
    const ref = toUtcDate(input.referenceDate);
    const text = input.text;

    const categorySlug = normalizeProduceName(text);
    const produceName = categorySlug ? categoryNameFromSlug(categorySlug) : null;

    const { quantity, unit } = parseQuantityAndUnit(text);
    const pricePerUnit = parsePrice(text);
    const minimumOrderQuantity = parseMinimumOrder(text);

    const location = detectLocationInText(text);
    const date = parseRelativeDate(text, ref);
    const dateStr = date ? formatDate(date) : null;

    const missingFields: string[] = [];
    if (!produceName) missingFields.push('produceName');
    if (quantity === null) missingFields.push('quantity');
    if (!unit) missingFields.push('unit');
    if (pricePerUnit === null) missingFields.push('pricePerUnit');
    if (!dateStr) missingFields.push('harvestDate');
    if (!location) {
      missingFields.push('region', 'district');
    }
    if (minimumOrderQuantity === null) missingFields.push('minimumOrderQuantity');

    const clarificationQuestions: string[] = [];
    if (!produceName) clarificationQuestions.push('What produce are you offering?');
    if (quantity === null || !unit) {
      clarificationQuestions.push('How much produce do you have, and in what unit (crates, bags, kg)?');
    }
    if (pricePerUnit === null) clarificationQuestions.push('What price are you asking per unit?');
    if (!dateStr) clarificationQuestions.push('When will the produce be ready or available?');
    if (!location) {
      clarificationQuestions.push('Which town, district and region is the farm located in?');
    }

    // Confidence reflects how many key fields were confidently extracted.
    let confidence = 0.35;
    if (produceName) confidence += 0.2;
    if (quantity !== null) confidence += 0.15;
    if (unit) confidence += 0.1;
    if (dateStr) confidence += 0.1;
    if (location) confidence += 0.08;
    if (pricePerUnit !== null) confidence += 0.05;
    confidence = Math.min(0.98, Math.round(confidence * 100) / 100);

    return {
      produceName,
      categorySlug,
      quantity,
      unit,
      location: {
        town: location?.town ?? null,
        district: location?.district ?? null,
        region: location?.region ?? null,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
      },
      harvestDate: dateStr,
      availableFrom: dateStr,
      pricePerUnit,
      minimumOrderQuantity,
      confidence,
      missingFields,
      clarificationQuestions,
    };
  },
};
