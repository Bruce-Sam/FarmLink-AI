import { config as loadEnv } from 'dotenv';

loadEnv();

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??=
  'postgresql://postgres:postgres@localhost:5432/farmlink_test?schema=public';
process.env.JWT_ACCESS_SECRET ??= 'test-jwt-secret-minimum-32-characters-long';
process.env.AI_PROVIDER ??= 'local';
process.env.LOG_LEVEL ??= 'silent';

import { vi } from 'vitest';
import { buildMockPrisma } from './helpers/fixtures';

export const mockPrisma = buildMockPrisma();

vi.mock('../src/config/database', () => ({
  prisma: mockPrisma,
  connectDatabase: vi.fn(),
  disconnectDatabase: vi.fn(),
  checkDatabaseHealth: vi.fn().mockResolvedValue(true),
}));
