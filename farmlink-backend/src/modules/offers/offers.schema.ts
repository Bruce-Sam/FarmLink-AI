import { z } from 'zod';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../../constants/pagination';

export const createOfferSchema = z.object({
  listingId: z.string().uuid(),
  offeredQuantity: z.coerce.number().positive().max(1_000_000),
  offeredPricePerUnit: z.coerce.number().positive().max(10_000_000),
  message: z.string().trim().max(1000).optional(),
  proposedPickupDate: z.coerce.date(),
  expiresAt: z.coerce.date().optional(),
});

export const offerListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).default(DEFAULT_LIMIT),
  status: z.string().trim().optional(),
});

export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type OfferListQuery = z.infer<typeof offerListQuerySchema>;
