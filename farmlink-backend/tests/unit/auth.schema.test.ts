import { describe, it, expect } from 'vitest';
import { Role } from '@prisma/client';
import { registerSchema, loginSchema } from '../../src/modules/auth/auth.schema';

describe('Auth validation schemas', () => {
  it('accepts valid farmer registration', () => {
    const parsed = registerSchema.parse({
      fullName: 'Kwame Mensah',
      phoneNumber: '+233240000000',
      email: 'kwame@example.com',
      password: 'StrongPassword123!',
      role: Role.FARMER,
    });
    expect(parsed.role).toBe(Role.FARMER);
    expect(parsed.phoneNumber).toBe('+233240000000');
  });

  it('accepts valid buyer registration', () => {
    const parsed = registerSchema.parse({
      fullName: 'Ama Boateng',
      phoneNumber: '0244555667',
      password: 'BuyerPassword123!',
      role: Role.BUYER,
    });
    expect(parsed.role).toBe(Role.BUYER);
  });

  it('rejects administrator self-registration', () => {
    expect(() =>
      registerSchema.parse({
        fullName: 'Bad Actor',
        phoneNumber: '+233200000001',
        password: 'AdminPassword123!',
        role: Role.ADMIN,
      }),
    ).toThrow(/administrator/i);
  });

  it('accepts login with identifier', () => {
    const parsed = loginSchema.parse({
      identifier: 'kwame@example.com',
      password: 'secret',
    });
    expect(parsed.identifier).toBe('kwame@example.com');
  });

  it('accepts login with email alias (frontend compatibility)', () => {
    const parsed = loginSchema.parse({
      email: 'buyer@farmlink.local',
      password: 'secret',
    });
    expect(parsed.identifier).toBe('buyer@farmlink.local');
  });
});
