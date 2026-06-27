import { z } from 'zod';
import { latitudeSchema, longitudeSchema } from '../../utils/common-schemas';

export const createFarmerProfileSchema = z.object({
  farmName: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2000).optional(),
  region: z.string().trim().min(2).max(100),
  district: z.string().trim().min(2).max(100),
  town: z.string().trim().min(1).max(100),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  primaryCrops: z.array(z.string().trim().min(1)).max(30).default([]),
  farmSizeAcres: z.coerce.number().positive().max(100000).optional(),
});

export const updateFarmerProfileSchema = createFarmerProfileSchema.partial();

export type CreateFarmerProfileInput = z.infer<typeof createFarmerProfileSchema>;
export type UpdateFarmerProfileInput = z.infer<typeof updateFarmerProfileSchema>;
