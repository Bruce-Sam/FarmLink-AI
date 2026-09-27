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

  it('rejects default ADMIN_PASSWORD in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgres://localhost';
    process.env.JWT_ACCESS_SECRET = 'some-very-secret-key-16-chars-min';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';

    await expect(async () => {
      await import('../../src/config/env');
    }).rejects.toThrow('ADMIN_PASSWORD must be changed from the default value in production.');
  });

  it('does not reject default ADMIN_PASSWORD in development', async () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgres://localhost';
    process.env.JWT_ACCESS_SECRET = 'some-very-secret-key-16-chars-min';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';

    await expect(import('../../src/config/env')).resolves.toBeDefined();
  });
});
