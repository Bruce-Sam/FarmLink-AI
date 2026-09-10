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

  it('should not throw in development when default ADMIN_PASSWORD is used', async () => {
    process.env.NODE_ENV = 'development';
    // Let ADMIN_PASSWORD fall back to the default
    delete process.env.ADMIN_PASSWORD;

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('should not throw in test when default ADMIN_PASSWORD is used', async () => {
    process.env.NODE_ENV = 'test';
    // Let ADMIN_PASSWORD fall back to the default
    delete process.env.ADMIN_PASSWORD;

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('AdminPassword123!');
  });

  it('should throw an error in production when default ADMIN_PASSWORD is used', async () => {
    process.env.NODE_ENV = 'production';
    // Let ADMIN_PASSWORD fall back to the default
    delete process.env.ADMIN_PASSWORD;
    // Set other required values so validation passes before our check
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.JWT_ACCESS_SECRET = 'secure-secret-key-16chars-long';

    await expect(import('../../src/config/env')).rejects.toThrow(
      'ADMIN_PASSWORD must be changed from the default value in production.'
    );
  });

  it('should not throw in production when a custom ADMIN_PASSWORD is used', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_PASSWORD = 'SecurePassword456!';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.JWT_ACCESS_SECRET = 'secure-secret-key-16chars-long';

    const { config } = await import('../../src/config/env');
    expect(config.ADMIN_PASSWORD).toBe('SecurePassword456!');
  });
});
