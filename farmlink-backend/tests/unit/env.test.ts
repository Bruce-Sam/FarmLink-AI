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

  it('should throw an error in production if JWT_ACCESS_SECRET is the example value', async () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_ACCESS_SECRET = 'replace-with-a-long-random-secret-at-least-32-characters';
    process.env.DATABASE_URL = 'postgres://fake';

    await expect(import('../../src/config/env')).rejects.toThrow(
      'JWT_ACCESS_SECRET must be changed from the example value in production.'
    );
  });

  it('should throw an error in production if ADMIN_PASSWORD is the default value', async () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_ACCESS_SECRET = 'a-secure-secret-that-is-at-least-32-chars';
    process.env.DATABASE_URL = 'postgres://fake';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';

    await expect(import('../../src/config/env')).rejects.toThrow(
      'ADMIN_PASSWORD must be changed from the default value in production.'
    );
  });

  it('should not throw in development even with default secrets', async () => {
    process.env.NODE_ENV = 'development';
    process.env.JWT_ACCESS_SECRET = 'replace-with-a-long-random-secret-at-least-32-characters';
    process.env.DATABASE_URL = 'postgres://fake';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';

    const { config } = await import('../../src/config/env');
    expect(config.isDevelopment).toBe(true);
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });
});
