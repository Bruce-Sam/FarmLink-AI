import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should not throw in development if default secrets are used', async () => {
    process.env.NODE_ENV = 'development';
    process.env.JWT_ACCESS_SECRET = 'replace-with-this-is-a-long-enough-secret-for-dev';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';

    const { config } = await import('../../src/config/env');
    expect(config.isDevelopment).toBe(true);
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('should not throw in test if default secrets are used', async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_ACCESS_SECRET = 'replace-with-this-is-a-long-enough-secret-for-test';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';

    const { config } = await import('../../src/config/env');
    expect(config.isTest).toBe(true);
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('should throw in production if default JWT_ACCESS_SECRET is used', async () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_ACCESS_SECRET = 'replace-with-a-long-random-secret-at-least-32-characters';
    process.env.ADMIN_PASSWORD = 'StrongAdminPassword123!';

    await expect(import('../../src/config/env')).rejects.toThrow(
      'JWT_ACCESS_SECRET must be changed from the example value in production.'
    );
  });

  it('should throw in production if default ADMIN_PASSWORD is used', async () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_ACCESS_SECRET = 'this-is-a-secure-production-secret-without-the-placeholder';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';

    await expect(import('../../src/config/env')).rejects.toThrow(
      'ADMIN_PASSWORD must be changed from the default value in production.'
    );
  });

  it('should load configuration successfully in production with secure secrets', async () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_ACCESS_SECRET = 'this-is-a-secure-production-secret-without-the-placeholder';
    process.env.ADMIN_PASSWORD = 'StrongAdminPassword123!';

    const { config } = await import('../../src/config/env');
    expect(config.isProduction).toBe(true);
    expect(config.ADMIN_PASSWORD).toBe('StrongAdminPassword123!');
  });
});
