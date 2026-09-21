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

  it('should throw an error in production if default ADMIN_PASSWORD is used', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.JWT_ACCESS_SECRET = 'super-secret-key-123456';
    // ADMIN_PASSWORD is NOT set, so it uses default 'AdminPassword123!'

    await expect(async () => {
      await import('../../src/config/env');
    }).rejects.toThrow('ADMIN_PASSWORD must be changed from the default value in production.');
  });

  it('should not throw an error in production if a custom ADMIN_PASSWORD is used', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.JWT_ACCESS_SECRET = 'super-secret-key-123456';
    process.env.ADMIN_PASSWORD = 'StrongCustomPassword99!';

    const module = await import('../../src/config/env');
    expect(module.config.ADMIN_PASSWORD).toBe('StrongCustomPassword99!');
  });

  it('should not throw an error in development if default ADMIN_PASSWORD is used', async () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.JWT_ACCESS_SECRET = 'super-secret-key-123456';
    // ADMIN_PASSWORD is NOT set, so it uses default 'AdminPassword123!'

    const module = await import('../../src/config/env');
    expect(module.config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('should not throw an error in test if default ADMIN_PASSWORD is used', async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.JWT_ACCESS_SECRET = 'super-secret-key-123456';
    // ADMIN_PASSWORD is NOT set, so it uses default 'AdminPassword123!'

    const module = await import('../../src/config/env');
    expect(module.config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });
});
