import { z } from 'zod';
import { BuyerType, ProduceUnit } from '@prisma/client';
import { latitudeSchema, longitudeSchema } from '../../utils/common-schemas';

export const createBuyerProfileSchema = z.object({
  businessName: z.string().trim().min(2).max(150),
  buyerType: z.nativeEnum(BuyerType),
  description: z.string().trim().max(2000).optional(),
  region: z.string().trim().min(2).max(100),
  district: z.string().trim().min(2).max(100),
  town: z.string().trim().min(1).max(100),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  preferredProduce: z.array(z.string().trim().min(1)).max(50).default([]),
  minimumOrderQuantity: z.coerce.number().positive().max(1_000_000).optional(),
  maximumTravelDistanceKm: z.coerce.number().int().positive().max(2000).default(100),
});

export const updateBuyerProfileSchema = createBuyerProfileSchema.partial();

export const createDemandSchema = z
  .object({
    categoryId: z.string().uuid(),
    minimumQuantity: z.coerce.number().positive().max(1_000_000),
    maximumQuantity: z.coerce.number().positive().max(1_000_000).optional(),
    unit: z.nativeEnum(ProduceUnit),
    preferredPriceMaximum: z.coerce.number().positive().max(10_000_000).optional(),
    requiredFrom: z.coerce.date().optional(),
    requiredUntil: z.coerce.date().optional(),
    preferredRegions: z.array(z.string().trim().min(1)).max(20).default([]),
    isRecurring: z.boolean().default(false),
    frequency: z.string().trim().max(50).optional(),
    isActive: z.boolean().default(true),
  })
  .refine(
    (d) => d.maximumQuantity === undefined || d.maximumQuantity >= d.minimumQuantity,
    { message: 'maximumQuantity must be greater than or equal to minimumQuantity', path: ['maximumQuantity'] },
  );

export const updateDemandSchema = z
  .object({
    categoryId: z.string().uuid().optional(),
    minimumQuantity: z.coerce.number().positive().max(1_000_000).optional(),
    maximumQuantity: z.coerce.number().positive().max(1_000_000).optional(),
    unit: z.nativeEnum(ProduceUnit).optional(),
    preferredPriceMaximum: z.coerce.number().positive().max(10_000_000).optional(),
    requiredFrom: z.coerce.date().optional(),
    requiredUntil: z.coerce.date().optional(),
    preferredRegions: z.array(z.string().trim().min(1)).max(20).optional(),
    isRecurring: z.boolean().optional(),
    frequency: z.string().trim().max(50).optional(),
    isActive: z.boolean().optional(),
  });

export type CreateBuyerProfileInput = z.infer<typeof createBuyerProfileSchema>;
export type UpdateBuyerProfileInput = z.infer<typeof updateBuyerProfileSchema>;
export type CreateDemandInput = z.infer<typeof createDemandSchema>;
export type UpdateDemandInput = z.infer<typeof updateDemandSchema>;
