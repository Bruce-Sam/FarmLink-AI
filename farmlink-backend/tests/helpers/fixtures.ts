import { vi } from 'vitest';
import { Role, AccountStatus } from '@prisma/client';

export const mockUserFarmer = {
  id: 'farmer-user-id',
  fullName: 'Demo Farmer',
  phoneNumber: '+233241111111',
  email: 'farmer@farmlink.local',
  passwordHash: '$2a$10$hashed',
  role: Role.FARMER,
  accountStatus: AccountStatus.ACTIVE,
  phoneVerified: true,
  profileImageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: null,
};

export const mockUserBuyer = {
  ...mockUserFarmer,
  id: 'buyer-user-id',
  email: 'buyer@farmlink.local',
  role: Role.BUYER,
};

export const mockFarmerProfile = {
  id: 'farmer-profile-id',
  userId: mockUserFarmer.id,
  farmName: 'Sunrise Farm',
  region: 'Ashanti',
  district: 'Asante Akim North',
  town: 'Agogo',
  latitude: 6.8001,
  longitude: -1.0819,
};

export const mockBuyerProfile = {
  id: 'buyer-profile-id',
  userId: mockUserBuyer.id,
  businessName: 'Golden Spoon Restaurant',
  region: 'Ashanti',
  district: 'Kumasi Metropolitan',
  town: 'Kumasi',
  latitude: 6.6885,
  longitude: -1.6244,
};

export function buildMockPrisma() {
  const mock = {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    farmerProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    buyerProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    produceCategory: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    produceListing: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    offer: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    produceTransaction: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    matchRecommendation: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      updateMany: vi.fn(),
    },
    notification: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    buyerDemand: {
      findMany: vi.fn(),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    $transaction: vi.fn(),
  };

  mock.$transaction.mockImplementation(async (fn: (tx: typeof mock) => unknown) => fn(buildMockPrisma()));

  return mock;
}

export type MockPrisma = ReturnType<typeof buildMockPrisma>;
