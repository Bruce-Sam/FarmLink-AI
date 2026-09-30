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

  it('should accept default ADMIN_PASSWORD and JWT_ACCESS_SECRET in development', async () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';
    process.env.JWT_ACCESS_SECRET = 'replace-with-a-long-random-secret';

    // Should not throw
    const { config } = await import('../../src/config/env');
    expect(config.isDevelopment).toBe(true);
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('should accept default ADMIN_PASSWORD and JWT_ACCESS_SECRET in test', async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';
    process.env.JWT_ACCESS_SECRET = 'replace-with-a-long-random-secret';

    // Should not throw
    const { config } = await import('../../src/config/env');
    expect(config.isTest).toBe(true);
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('should throw an error in production if default ADMIN_PASSWORD is used', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';
    process.env.JWT_ACCESS_SECRET = 'a-very-secure-secret-that-is-not-default';

    await expect(import('../../src/config/env')).rejects.toThrow(
      'ADMIN_PASSWORD must be changed from the default value in production.',
    );
  });

  it('should throw an error in production if default JWT_ACCESS_SECRET is used', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.ADMIN_PASSWORD = 'a-secure-admin-password';
    process.env.JWT_ACCESS_SECRET = 'replace-with-a-long-random-secret';

    await expect(import('../../src/config/env')).rejects.toThrow(
      'JWT_ACCESS_SECRET must be changed from the example value in production.',
    );
  });

  it('should load correctly in production if safe secrets are provided', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.ADMIN_PASSWORD = 'a-secure-admin-password';
    process.env.JWT_ACCESS_SECRET = 'a-very-secure-secret-that-is-not-default';

    // Should not throw
    const { config } = await import('../../src/config/env');
    expect(config.isProduction).toBe(true);
    expect(config.ADMIN_PASSWORD).toBe('a-secure-admin-password');
    expect(config.JWT_ACCESS_SECRET).toBe('a-very-secure-secret-that-is-not-default');
  });
});
