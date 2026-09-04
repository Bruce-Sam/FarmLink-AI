import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Environment Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('allows default ADMIN_PASSWORD in development', async () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';
    process.env.JWT_ACCESS_SECRET = 'test-secret-value-long-enough';
    // ADMIN_PASSWORD is left unset, it will default to AdminPassword123!
    delete process.env.ADMIN_PASSWORD;

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('throws an error if default ADMIN_PASSWORD is used in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';
    process.env.JWT_ACCESS_SECRET = 'this-is-a-secure-production-secret';
    // ADMIN_PASSWORD is left unset, defaulting to AdminPassword123!
    delete process.env.ADMIN_PASSWORD;

    await expect(import('../../src/config/env')).rejects.toThrow(
      'ADMIN_PASSWORD must be changed from the default value in production.'
    );
  });

  it('succeeds in production if custom ADMIN_PASSWORD is provided', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';
    process.env.JWT_ACCESS_SECRET = 'this-is-a-secure-production-secret';
    process.env.ADMIN_PASSWORD = 'StrongAdminPassword_999';

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('StrongAdminPassword_999');
  });

  it('throws an error if default JWT_ACCESS_SECRET is used in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';
    process.env.JWT_ACCESS_SECRET = 'replace-with-a-long-random-secret-at-least-32-characters';
    process.env.ADMIN_PASSWORD = 'StrongAdminPassword_999';

    await expect(import('../../src/config/env')).rejects.toThrow(
      'JWT_ACCESS_SECRET must be changed from the example value in production.'
    );
  });
});
