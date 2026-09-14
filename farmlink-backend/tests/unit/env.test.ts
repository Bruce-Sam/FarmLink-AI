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
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('rejects default ADMIN_PASSWORD in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';
    process.env.JWT_ACCESS_SECRET = 'valid-secret-must-be-16-chars-long';

    await expect(import('../../src/config/env')).rejects.toThrow(
      'ADMIN_PASSWORD must be changed from the default value in production.'
    );
  });
});
