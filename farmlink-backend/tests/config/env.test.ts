import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should throw an error if ADMIN_PASSWORD is the default in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgres://fake';
    process.env.JWT_ACCESS_SECRET = 'something-secure-and-long-enough-for-test';
    // ADMIN_PASSWORD is not set, so it defaults to 'AdminPassword123!'

    await expect(async () => {
      await import('../../src/config/env');
    }).rejects.toThrow('ADMIN_PASSWORD must be changed from the default value in production.');
  });

  it('should not throw if ADMIN_PASSWORD is changed in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgres://fake';
    process.env.JWT_ACCESS_SECRET = 'something-secure-and-long-enough-for-test';
    process.env.ADMIN_PASSWORD = 'SecurePassword123!';

    const { config } = await import('../../src/config/env');
    expect(config.isProduction).toBe(true);
    expect(config.ADMIN_PASSWORD).toBe('SecurePassword123!');
  });

  it('should allow default ADMIN_PASSWORD in development', async () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgres://fake';
    process.env.JWT_ACCESS_SECRET = 'something-secure-and-long-enough-for-test';

    const { config } = await import('../../src/config/env');
    expect(config.isDevelopment).toBe(true);
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('should allow default ADMIN_PASSWORD in test', async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgres://fake';
    process.env.JWT_ACCESS_SECRET = 'something-secure-and-long-enough-for-test';

    const { config } = await import('../../src/config/env');
    expect(config.isTest).toBe(true);
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });
});
