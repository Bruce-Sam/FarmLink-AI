import { z } from 'zod';
import { AccountStatus, ListingStatus, Role } from '@prisma/client';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../../constants/pagination';

const pageFields = {
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).default(DEFAULT_LIMIT),
};

export const adminUsersQuerySchema = z.object({
  ...pageFields,
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(AccountStatus).optional(),
  search: z.string().trim().max(120).optional(),
});

export const adminListingsQuerySchema = z.object({
  ...pageFields,
  status: z.nativeEnum(ListingStatus).optional(),
  region: z.string().trim().optional(),
  category: z.string().trim().optional(),
});

export const adminGenericQuerySchema = z.object({
  ...pageFields,
  status: z.string().trim().optional(),
});

export const updateUserStatusSchema = z.object({
  status: z.nativeEnum(AccountStatus),
});

export const updateListingStatusSchema = z.object({
  status: z.nativeEnum(ListingStatus),
});

export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>;
export type AdminListingsQuery = z.infer<typeof adminListingsQuerySchema>;
export type AdminGenericQuery = z.infer<typeof adminGenericQuerySchema>;
