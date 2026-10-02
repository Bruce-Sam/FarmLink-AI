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

  it('should throw an error in production if ADMIN_PASSWORD is the default value', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';
    process.env.JWT_ACCESS_SECRET = 'valid-secret-must-be-at-least-16-characters';

    await expect(async () => {
      await import('../../src/config/env');
    }).rejects.toThrow('ADMIN_PASSWORD must be changed from the default value in production.');
  });

  it('should not throw an error in development if ADMIN_PASSWORD is the default value', async () => {
    process.env.NODE_ENV = 'development';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';
    process.env.JWT_ACCESS_SECRET = 'valid-secret-must-be-at-least-16-characters';

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('should not throw an error in test if ADMIN_PASSWORD is the default value', async () => {
    process.env.NODE_ENV = 'test';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';
    process.env.JWT_ACCESS_SECRET = 'valid-secret-must-be-at-least-16-characters';

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('should not throw an error in production if ADMIN_PASSWORD is changed', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_PASSWORD = 'SecurePassword456!';
    process.env.JWT_ACCESS_SECRET = 'valid-secret-must-be-at-least-16-characters';

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('SecurePassword456!');
  });
});
