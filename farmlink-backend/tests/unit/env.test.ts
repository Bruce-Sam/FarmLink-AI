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

  it('allows default ADMIN_PASSWORD in development', async () => {
    process.env.NODE_ENV = 'development';
    process.env.JWT_ACCESS_SECRET = 'secure-secret-key-123456';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('allows default ADMIN_PASSWORD in test', async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_ACCESS_SECRET = 'secure-secret-key-123456';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('throws an error if default ADMIN_PASSWORD is used in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_ACCESS_SECRET = 'secure-secret-key-123456';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';

    await expect(import('../../src/config/env')).rejects.toThrow(
      'ADMIN_PASSWORD must be changed from the default value in production.'
    );
  });

  it('allows a custom ADMIN_PASSWORD in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_ACCESS_SECRET = 'secure-secret-key-123456';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.ADMIN_PASSWORD = 'SecureAdminPassword123!';

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('SecureAdminPassword123!');
  });
});
