import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Environment Configuration Security', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should reject default ADMIN_PASSWORD in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.JWT_ACCESS_SECRET = 'very-secure-secret-key-that-is-long-enough';

    await expect(async () => {
      await import('../../src/config/env');
    }).rejects.toThrow('ADMIN_PASSWORD must be changed from the default value in production.');
  });

  it('should allow custom ADMIN_PASSWORD in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_PASSWORD = 'CustomSecurePassword456!';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.JWT_ACCESS_SECRET = 'very-secure-secret-key-that-is-long-enough';

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('CustomSecurePassword456!');
  });

  it('should preserve default ADMIN_PASSWORD in development', async () => {
    process.env.NODE_ENV = 'development';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.JWT_ACCESS_SECRET = 'very-secure-secret-key-that-is-long-enough';

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('should preserve default ADMIN_PASSWORD in test', async () => {
    process.env.NODE_ENV = 'test';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.JWT_ACCESS_SECRET = 'very-secure-secret-key-that-is-long-enough';

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });
});
