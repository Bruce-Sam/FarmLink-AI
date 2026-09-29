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

  it('should not throw when ADMIN_PASSWORD is default in development', async () => {
    process.env.NODE_ENV = 'development';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';
    process.env.JWT_ACCESS_SECRET = 'something_super_secure_that_is_long_enough';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';

    // Importing the module should evaluate it and run the config logic
    await expect(import('../../src/config/env')).resolves.toBeDefined();
  });

  it('should not throw when ADMIN_PASSWORD is default in test', async () => {
    process.env.NODE_ENV = 'test';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';
    process.env.JWT_ACCESS_SECRET = 'something_super_secure_that_is_long_enough';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';

    await expect(import('../../src/config/env')).resolves.toBeDefined();
  });

  it('should throw an error when ADMIN_PASSWORD is default in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_PASSWORD = 'AdminPassword123!';
    process.env.JWT_ACCESS_SECRET = 'something_super_secure_that_is_long_enough';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';

    await expect(import('../../src/config/env')).rejects.toThrow(
      'ADMIN_PASSWORD must be changed from the default value in production.'
    );
  });

  it('should not throw when ADMIN_PASSWORD is changed in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_PASSWORD = 'NewSecurePassword123!';
    process.env.JWT_ACCESS_SECRET = 'something_super_secure_that_is_long_enough';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';

    await expect(import('../../src/config/env')).resolves.toBeDefined();
  });
});
