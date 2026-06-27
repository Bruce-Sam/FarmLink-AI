import { z } from 'zod';
import { ListingSourceType, ProduceUnit } from '@prisma/client';
import { latitudeSchema, longitudeSchema } from '../../utils/common-schemas';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../../constants/pagination';

export const extractSchema = z.object({
  text: z.string().trim().min(3).max(2000),
  referenceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use an ISO date (YYYY-MM-DD)')
    .optional(),
});

export const createListingSchema = z
  .object({
    categoryId: z.string().uuid(),
    title: z.string().trim().min(3).max(150),
    description: z.string().trim().min(3).max(5000),
    quantity: z.coerce.number().positive().max(1_000_000),
    unit: z.nativeEnum(ProduceUnit),
    minimumOrderQuantity: z.coerce.number().positive().max(1_000_000).default(1),
    pricePerUnit: z.coerce.number().positive().max(10_000_000).optional(),
    currency: z.string().trim().length(3).default('GHS'),
    harvestDate: z.coerce.date(),
    availableFrom: z.coerce.date(),
    availableUntil: z.coerce.date().optional(),
    qualityGrade: z.string().trim().max(50).optional(),
    farmingMethod: z.string().trim().max(50).optional(),
    region: z.string().trim().min(2).max(100),
    district: z.string().trim().min(2).max(100),
    town: z.string().trim().min(1).max(100),
    latitude: latitudeSchema,
    longitude: longitudeSchema,
    sourceType: z.nativeEnum(ListingSourceType).default(ListingSourceType.FORM),
    rawInputText: z.string().trim().max(2000).optional(),
    aiExtractionConfidence: z.coerce.number().min(0).max(1).optional(),
  })
  .refine((d) => d.minimumOrderQuantity <= d.quantity, {
    message: 'minimumOrderQuantity cannot exceed quantity',
    path: ['minimumOrderQuantity'],
  })
  .refine((d) => !d.availableUntil || d.availableUntil >= d.availableFrom, {
    message: 'availableUntil must be on or after availableFrom',
    path: ['availableUntil'],
  });

export const updateListingSchema = z.object({
  categoryId: z.string().uuid().optional(),
  title: z.string().trim().min(3).max(150).optional(),
  description: z.string().trim().min(3).max(5000).optional(),
  quantity: z.coerce.number().positive().max(1_000_000).optional(),
  unit: z.nativeEnum(ProduceUnit).optional(),
  minimumOrderQuantity: z.coerce.number().positive().max(1_000_000).optional(),
  pricePerUnit: z.coerce.number().positive().max(10_000_000).optional(),
  currency: z.string().trim().length(3).optional(),
  harvestDate: z.coerce.date().optional(),
  availableFrom: z.coerce.date().optional(),
  availableUntil: z.coerce.date().optional(),
  qualityGrade: z.string().trim().max(50).optional(),
  farmingMethod: z.string().trim().max(50).optional(),
  region: z.string().trim().min(2).max(100).optional(),
  district: z.string().trim().min(2).max(100).optional(),
  town: z.string().trim().min(1).max(100).optional(),
  latitude: latitudeSchema.optional(),
  longitude: longitudeSchema.optional(),
});

const sortEnum = z
  .enum(['newest', 'oldest', 'priceAsc', 'priceDesc', 'harvestDate', 'distance'])
  .default('newest');

export const marketplaceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).default(DEFAULT_LIMIT),
  category: z.string().trim().optional(),
  region: z.string().trim().optional(),
  district: z.string().trim().optional(),
  town: z.string().trim().optional(),
  minQuantity: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  availableFrom: z.coerce.date().optional(),
  harvestDateFrom: z.coerce.date().optional(),
  harvestDateTo: z.coerce.date().optional(),
  unit: z.nativeEnum(ProduceUnit).optional(),
  search: z.string().trim().max(120).optional(),
  maxDistanceKm: z.coerce.number().positive().max(2000).optional(),
  sort: sortEnum,
});

export const myListingsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).default(DEFAULT_LIMIT),
  status: z.string().trim().optional(),
});

export type ExtractRequest = z.infer<typeof extractSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type MarketplaceQuery = z.infer<typeof marketplaceQuerySchema>;
export type MyListingsQuery = z.infer<typeof myListingsQuerySchema>;
