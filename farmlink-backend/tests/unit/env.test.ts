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

  it('should accept default ADMIN_PASSWORD in development environment', async () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgresql://dummy:dummy@localhost:5432/dummy';
    process.env.JWT_ACCESS_SECRET = 'this-is-a-long-enough-secret-key';

    // Do not set ADMIN_PASSWORD to allow the default

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('should accept default ADMIN_PASSWORD in test environment', async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://dummy:dummy@localhost:5432/dummy';
    process.env.JWT_ACCESS_SECRET = 'this-is-a-long-enough-secret-key';

    // Do not set ADMIN_PASSWORD to allow the default

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('should reject default ADMIN_PASSWORD in production environment', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://dummy:dummy@localhost:5432/dummy';
    process.env.JWT_ACCESS_SECRET = 'this-is-a-long-enough-secret-key';

    // Do not set ADMIN_PASSWORD, triggering the default

    await expect(import('../../src/config/env')).rejects.toThrowError(
      'ADMIN_PASSWORD must be changed from the default value in production.'
    );
  });

  it('should accept custom ADMIN_PASSWORD in production environment', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://dummy:dummy@localhost:5432/dummy';
    process.env.JWT_ACCESS_SECRET = 'this-is-a-long-enough-secret-key';
    process.env.ADMIN_PASSWORD = 'SecureAdminPassword456!';

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('SecureAdminPassword456!');
  });
});
