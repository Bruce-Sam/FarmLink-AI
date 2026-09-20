import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Environment Configuration Security', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    // Set required env vars to avoid zod validation errors
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.JWT_ACCESS_SECRET = 'a-very-secure-secret-that-is-long-enough';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should allow default ADMIN_PASSWORD in development', async () => {
    process.env.NODE_ENV = 'development';
    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('should throw error in production if ADMIN_PASSWORD is the default', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';
    await expect(import('../../src/config/env')).rejects.toThrow(
      'ADMIN_PASSWORD must be changed from the default value in production.'
    );
  });
});
