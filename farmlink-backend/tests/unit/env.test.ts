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

  it('should accept default ADMIN_PASSWORD in development', async () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/mydb';
    process.env.JWT_ACCESS_SECRET = 'a-very-long-secret-key-at-least-16-chars';
    delete process.env.ADMIN_PASSWORD;

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('should accept default ADMIN_PASSWORD in test', async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/mydb';
    process.env.JWT_ACCESS_SECRET = 'a-very-long-secret-key-at-least-16-chars';
    delete process.env.ADMIN_PASSWORD;

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('should throw an error if default ADMIN_PASSWORD is used in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/mydb';
    process.env.JWT_ACCESS_SECRET = 'a-very-long-secret-key-at-least-16-chars-not-default';
    delete process.env.ADMIN_PASSWORD;

    await expect(import('../../src/config/env')).rejects.toThrow(
      'ADMIN_PASSWORD must be changed from the default value in production.',
    );
  });
});
