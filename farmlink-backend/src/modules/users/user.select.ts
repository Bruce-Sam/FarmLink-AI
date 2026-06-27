import { type Prisma } from '@prisma/client';

// Whitelisted, safe user fields. Never exposes passwordHash.
export const safeUserSelect = {
  id: true,
  fullName: true,
  phoneNumber: true,
  email: true,
  role: true,
  accountStatus: true,
  phoneVerified: true,
  profileImageUrl: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>;
