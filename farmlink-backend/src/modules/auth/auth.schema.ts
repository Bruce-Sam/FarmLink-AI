import { z } from 'zod';
import { Role } from '@prisma/client';
import { normalizeEmail, normalizePhone } from '../../utils/normalize';

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(120),
  phoneNumber: z
    .string()
    .trim()
    .min(7, 'A valid phone number is required')
    .transform(normalizePhone),
  email: z.string().trim().email().transform(normalizeEmail).optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
  role: z.nativeEnum(Role).refine((role) => role !== Role.ADMIN, {
    message: 'You cannot register as an administrator',
  }),
});

export const loginSchema = z
  .object({
    identifier: z.string().trim().min(3).optional(),
    email: z.string().trim().min(3).optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .refine((data) => Boolean(data.identifier ?? data.email), {
    message: 'Provide your phone number or email',
    path: ['identifier'],
  })
  .transform((data) => ({
    identifier: (data.identifier ?? data.email)!,
    password: data.password,
  }));

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
