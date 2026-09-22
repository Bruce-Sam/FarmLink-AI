import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should throw an error if ADMIN_PASSWORD is default in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_ACCESS_SECRET = 'super-secret-production-key-at-least-16-chars';
    process.env.DATABASE_URL = 'postgres://user:pass@host/db';
    // ADMIN_PASSWORD not set, relies on default
    delete process.env.ADMIN_PASSWORD;

    await expect(() => import('../../src/config/env')).rejects.toThrow(
      'ADMIN_PASSWORD must be changed from the default value in production.'
    );
  });

  it('should allow default ADMIN_PASSWORD in development', async () => {
    process.env.NODE_ENV = 'development';
    process.env.JWT_ACCESS_SECRET = 'development-secret-key-at-least-16-chars';
    process.env.DATABASE_URL = 'postgres://user:pass@host/db';
    delete process.env.ADMIN_PASSWORD;

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });
});
