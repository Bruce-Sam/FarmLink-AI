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
    process.env.JWT_ACCESS_SECRET = 'this-is-a-super-secret-key-that-is-long-enough';

    // Importing env.ts dynamically to re-evaluate it with the new environment variables
    const { config } = await import('../../src/config/env');

    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
    expect(config.isDevelopment).toBe(true);
  });

  it('throws an error if ADMIN_PASSWORD is the default in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_ACCESS_SECRET = 'this-is-a-super-secret-key-that-is-long-enough';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';

    // Expect the module import to throw since the error is thrown at the top level
    await expect(import('../../src/config/env')).rejects.toThrow(
      'ADMIN_PASSWORD must be changed from the default value in production.'
    );
  });

  it('allows a custom ADMIN_PASSWORD in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_ACCESS_SECRET = 'this-is-a-super-secret-key-that-is-long-enough';
    process.env.ADMIN_PASSWORD = 'SecureAdminPassword456!';

    const { config } = await import('../../src/config/env');

    expect(config.ADMIN_PASSWORD).toBe('SecureAdminPassword456!');
    expect(config.isProduction).toBe(true);
  });
});
