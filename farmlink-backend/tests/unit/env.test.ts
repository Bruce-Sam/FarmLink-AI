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

  it('should throw an error in production if default ADMIN_PASSWORD is used', async () => {
    process.env.NODE_ENV = 'production';
    // Needs valid DATABASE_URL and JWT_ACCESS_SECRET to pass schema validation
    process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';
    process.env.JWT_ACCESS_SECRET = 'super-secret-production-key-12345';
    // Let ADMIN_PASSWORD fall back to default

    await expect(import('../../src/config/env')).rejects.toThrow(
      'ADMIN_PASSWORD must be changed from the default value in production.'
    );
  });

  it('should not throw an error in development if default ADMIN_PASSWORD is used', async () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';
    process.env.JWT_ACCESS_SECRET = 'super-secret-development-key-12345';
    // Let ADMIN_PASSWORD fall back to default

    const env = await import('../../src/config/env');
    expect(env.config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });
});
