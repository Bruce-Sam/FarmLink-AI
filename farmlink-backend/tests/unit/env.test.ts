import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Environment Configuration (env.ts)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should allow default ADMIN_PASSWORD in development environment', async () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';
    process.env.JWT_ACCESS_SECRET = 'supersecret_long_enough_key_1234567890';

    // We do NOT set process.env.ADMIN_PASSWORD, so it uses the default

    const { config } = await import('../../src/config/env');

    expect(config.isDevelopment).toBe(true);
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('should allow default ADMIN_PASSWORD in test environment', async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';
    process.env.JWT_ACCESS_SECRET = 'supersecret_long_enough_key_1234567890';

    // We do NOT set process.env.ADMIN_PASSWORD, so it uses the default

    const { config } = await import('../../src/config/env');

    expect(config.isTest).toBe(true);
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('should throw an error if default ADMIN_PASSWORD is used in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';
    process.env.JWT_ACCESS_SECRET = 'supersecret_long_enough_key_1234567890';

    // We do NOT set process.env.ADMIN_PASSWORD, so it defaults to AdminPassword123!

    await expect(async () => {
      await import('../../src/config/env');
    }).rejects.toThrow('ADMIN_PASSWORD must be changed from the default value in production.');
  });

  it('should allow a custom ADMIN_PASSWORD in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';
    process.env.JWT_ACCESS_SECRET = 'supersecret_long_enough_key_1234567890';
    process.env.ADMIN_PASSWORD = 'SecureAdminPassword456!';

    const { config } = await import('../../src/config/env');

    expect(config.isProduction).toBe(true);
    expect(config.ADMIN_PASSWORD).toBe('SecureAdminPassword456!');
  });
});
