import { describe, expect, it } from 'vitest';
import {
  adminRoleLabel,
  isAdminUser,
  mapBackendRole,
  mapBackendUserToSessionUser,
} from '@/lib/auth/admin-auth';
import { adminDemoUser } from '@/mocks/admin-data';

describe('Admin auth helpers', () => {
  it('maps backend ADMIN role to admin session role', () => {
    expect(mapBackendRole('ADMIN')).toBe('admin');
    expect(mapBackendRole('admin')).toBe('admin');
    expect(mapBackendRole('FARMER')).toBe('farmer');
  });

  it('maps backend admin user to session user', () => {
    const sessionUser = mapBackendUserToSessionUser(adminDemoUser);
    expect(sessionUser.role).toBe('admin');
    expect(sessionUser.fullName).toBe('FarmLink Administrator');
    expect(sessionUser.email).toBe('admin@farmlink.local');
  });

  it('identifies admin users', () => {
    const sessionUser = mapBackendUserToSessionUser(adminDemoUser);
    expect(isAdminUser(sessionUser)).toBe(true);
    expect(isAdminUser({ ...sessionUser, role: 'farmer' })).toBe(false);
    expect(isAdminUser(null)).toBe(false);
  });

  it('labels admin roles for display', () => {
    expect(adminRoleLabel('ADMIN')).toBe('Administrator');
    expect(adminRoleLabel('FARMER')).toBe('Farmer');
    expect(adminRoleLabel('BUYER')).toBe('Buyer');
  });
});
