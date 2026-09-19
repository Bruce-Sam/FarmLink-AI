import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Environment Configuration (env.ts)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('allows the default ADMIN_PASSWORD in development environment', async () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';
    process.env.JWT_ACCESS_SECRET = 'supersecret_for_dev_that_is_long_enough';

    const { config } = await import('../../src/config/env');

    expect(config.isDevelopment).toBe(true);
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('throws an error if the default ADMIN_PASSWORD is used in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgres://prod:prod@db:5432/prod';
    process.env.JWT_ACCESS_SECRET = 'a_very_secure_production_secret_key';
    // Not setting ADMIN_PASSWORD to simulate default fallback

    await expect(import('../../src/config/env')).rejects.toThrow(
      'ADMIN_PASSWORD must be changed from the default value in production.'
    );
  });

  it('allows a custom ADMIN_PASSWORD in production environment', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgres://prod:prod@db:5432/prod';
    process.env.JWT_ACCESS_SECRET = 'a_very_secure_production_secret_key';
    process.env.ADMIN_PASSWORD = 'SuperSecureCustomPassword123!';

    const { config } = await import('../../src/config/env');

    expect(config.isProduction).toBe(true);
    expect(config.ADMIN_PASSWORD).toBe('SuperSecureCustomPassword123!');
  });
});
