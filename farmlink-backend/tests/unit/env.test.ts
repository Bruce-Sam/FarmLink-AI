import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Environment configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  it('fails startup in production if ADMIN_PASSWORD is missing (falls back to default)', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ADMIN_PASSWORD;
    process.env.JWT_ACCESS_SECRET = 'a-very-long-secure-secret-that-is-at-least-16-chars';
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/farmlink';

    await expect(import('../../src/config/env?v1')).rejects.toThrow('ADMIN_PASSWORD must be changed');
  });

  it('fails startup in production if ADMIN_PASSWORD is the default value', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';
    process.env.JWT_ACCESS_SECRET = 'a-very-long-secure-secret-that-is-at-least-16-chars';
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/farmlink';

    await expect(import('../../src/config/env?v2')).rejects.toThrow('ADMIN_PASSWORD must be changed');
  });

  it('succeeds startup in production if ADMIN_PASSWORD is secure', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_PASSWORD = 'SecurePassword456!';
    process.env.JWT_ACCESS_SECRET = 'a-very-long-secure-secret-that-is-at-least-16-chars';
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/farmlink';

    const { config } = await import('../../src/config/env?v3');
    expect(config.isProduction).toBe(true);
    expect(config.ADMIN_PASSWORD).toBe('SecurePassword456!');
  });

  it('succeeds startup in development even if ADMIN_PASSWORD is the default value', async () => {
    process.env.NODE_ENV = 'development';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';
    process.env.JWT_ACCESS_SECRET = 'a-very-long-secure-secret-that-is-at-least-16-chars';
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/farmlink';

    const { config } = await import('../../src/config/env?v4');
    expect(config.isDevelopment).toBe(true);
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('succeeds startup in development even if ADMIN_PASSWORD is missing', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.ADMIN_PASSWORD;
    process.env.JWT_ACCESS_SECRET = 'a-very-long-secure-secret-that-is-at-least-16-chars';
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/farmlink';

    const { config } = await import('../../src/config/env?v5');
    expect(config.isDevelopment).toBe(true);
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });
});
