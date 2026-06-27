import { z } from 'zod';

export const latitudeSchema = z.coerce.number().min(-90).max(90);
export const longitudeSchema = z.coerce.number().min(-180).max(180);

export const uuidParam = (key: string) =>
  z.object({ [key]: z.string().uuid('Invalid identifier') });

export const isoDateString = z
  .string()
  .datetime({ offset: true })
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use an ISO date (YYYY-MM-DD)'));

export const positiveMoney = z.coerce.number().positive().max(10_000_000);
export const nonNegativeMoney = z.coerce.number().nonnegative().max(10_000_000);
export const positiveQuantity = z.coerce.number().positive().max(1_000_000);
