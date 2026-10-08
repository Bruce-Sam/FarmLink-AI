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

  it('allows default ADMIN_PASSWORD in development', async () => {
    process.env.NODE_ENV = 'development';
    process.env.JWT_ACCESS_SECRET = 'super-secret-key-12345';
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('rejects default ADMIN_PASSWORD in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_ACCESS_SECRET = 'super-secret-key-12345';
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';

    await expect(import('../../src/config/env')).rejects.toThrow(/ADMIN_PASSWORD must be changed/);
  });
});
