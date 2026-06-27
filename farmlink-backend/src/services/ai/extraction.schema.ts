import { z } from 'zod';
import { ProduceUnit } from '@prisma/client';

// Input accepted by the extraction endpoint / service.
export const extractionInputSchema = z.object({
  text: z.string().min(3, 'Provide a longer produce description').max(2000),
  referenceDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use an ISO date (YYYY-MM-DD)'))
    .optional(),
});

export type ExtractionInput = z.infer<typeof extractionInputSchema>;

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
  .nullable();

// Strict schema for validating ANY provider output before it is trusted.
export const extractionResultSchema = z.object({
  produceName: z.string().min(1).nullable(),
  categorySlug: z.string().min(1).nullable(),
  quantity: z.number().positive().nullable(),
  unit: z.nativeEnum(ProduceUnit).nullable(),
  location: z.object({
    town: z.string().nullable(),
    district: z.string().nullable(),
    region: z.string().nullable(),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
  }),
  harvestDate: isoDate,
  availableFrom: isoDate,
  pricePerUnit: z.number().nonnegative().nullable(),
  minimumOrderQuantity: z.number().positive().nullable(),
  confidence: z.number().min(0).max(1),
  missingFields: z.array(z.string()),
  clarificationQuestions: z.array(z.string()),
});

export type ExtractionResult = z.infer<typeof extractionResultSchema>;
