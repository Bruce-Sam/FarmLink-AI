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

  it('should throw an error in production if ADMIN_PASSWORD is the default value', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';
    // Ensure JWT_ACCESS_SECRET is valid to prevent it from throwing first
    process.env.JWT_ACCESS_SECRET = 'valid-secret-key-at-least-16-chars';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';

    await expect(import('../../src/config/env')).rejects.toThrow(
      'ADMIN_PASSWORD must be changed from the default value in production.'
    );
  });

  it('should not throw an error in production if ADMIN_PASSWORD is a custom value', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_PASSWORD = 'SecurePassword456!';
    process.env.JWT_ACCESS_SECRET = 'valid-secret-key-at-least-16-chars';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('SecurePassword456!');
    expect(config.isProduction).toBe(true);
  });

  it('should not throw an error in development if ADMIN_PASSWORD is the default value', async () => {
    process.env.NODE_ENV = 'development';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
    expect(config.isDevelopment).toBe(true);
  });

  it('should not throw an error in test if ADMIN_PASSWORD is the default value', async () => {
    process.env.NODE_ENV = 'test';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
    expect(config.isTest).toBe(true);
  });
});
