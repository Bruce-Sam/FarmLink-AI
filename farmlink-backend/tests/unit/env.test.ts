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

  it('preserves existing behavior in development for default ADMIN_PASSWORD', async () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';
    process.env.JWT_ACCESS_SECRET = 'super-secret-key-that-is-long-enough';

    const { config } = await import('../../src/config/env');

    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('rejects default ADMIN_PASSWORD in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';
    process.env.JWT_ACCESS_SECRET = 'super-secret-key-that-is-long-enough';

    await expect(import('../../src/config/env')).rejects.toThrow(
      'ADMIN_PASSWORD must be changed from the default value in production.'
    );
  });
});
