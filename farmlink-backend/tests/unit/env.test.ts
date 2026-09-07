import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Environment Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should throw an error in production if ADMIN_PASSWORD is the default value', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/db';
    process.env.JWT_ACCESS_SECRET = 'a-secure-secret-that-is-long-enough';
    // ADMIN_PASSWORD not set, so it uses the default

    await expect(async () => {
      await import('../../src/config/env');
    }).rejects.toThrow('ADMIN_PASSWORD must be changed from the default value in production.');
  });

  it('should not throw an error in production if ADMIN_PASSWORD is a custom value', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/db';
    process.env.JWT_ACCESS_SECRET = 'a-secure-secret-that-is-long-enough';
    process.env.ADMIN_PASSWORD = 'CustomSecurePassword123!';

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('CustomSecurePassword123!');
  });
});
