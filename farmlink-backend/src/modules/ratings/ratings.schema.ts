import { z } from 'zod';

export const createRatingSchema = z.object({
  transactionId: z.string().uuid(),
  targetRole: z.enum(['farmer', 'buyer']),
  score: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

export type CreateRatingInput = z.infer<typeof createRatingSchema>;
