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

  it('should throw an error in production if default JWT_ACCESS_SECRET is used', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://fake:fake@localhost:5432/db';
    process.env.JWT_ACCESS_SECRET = 'replace-with-a-long-random-secret';
    process.env.ADMIN_PASSWORD = 'NewSecurePassword!2024';

    await expect(import('../../src/config/env')).rejects.toThrow(
      'JWT_ACCESS_SECRET must be changed from the example value in production.'
    );
  });

  it('should throw an error in production if default ADMIN_PASSWORD is used', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://fake:fake@localhost:5432/db';
    process.env.JWT_ACCESS_SECRET = 'a-very-secure-secret-key-that-is-long';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';

    await expect(import('../../src/config/env')).rejects.toThrow(
      'ADMIN_PASSWORD must be changed from the default value in production.'
    );
  });
});
