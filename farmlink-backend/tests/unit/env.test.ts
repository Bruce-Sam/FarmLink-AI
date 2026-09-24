import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('preserves existing behavior in development/test environments for ADMIN_PASSWORD', async () => {
    process.env.NODE_ENV = 'test';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';
    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('rejects default ADMIN_PASSWORD in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';

    await expect(async () => {
      await import('../../src/config/env');
    }).rejects.toThrow('ADMIN_PASSWORD must be changed from the default value in production.');
  });
});
