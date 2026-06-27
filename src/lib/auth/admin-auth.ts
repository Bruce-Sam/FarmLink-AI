import type { User, UserRole } from '@/types/auth';
import type { AdminUser, AdminUserRole } from '@/types/admin';

export function mapBackendRole(role: string): UserRole {
  const normalized = role.toLowerCase();
  if (normalized === 'farmer' || normalized === 'buyer' || normalized === 'admin') {
    return normalized;
  }
  return 'farmer';
}

export function mapBackendUserToSessionUser(user: AdminUser): User {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email ?? user.phoneNumber,
    phone: user.phoneNumber,
    role: mapBackendRole(user.role),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    avatarUrl: user.profileImageUrl ?? undefined,
  };
}

export function isAdminUser(user: User | null | undefined): boolean {
  return user?.role === 'admin';
}

export function adminRoleLabel(role: AdminUserRole): string {
  switch (role) {
    case 'FARMER':
      return 'Farmer';
    case 'BUYER':
      return 'Buyer';
    case 'ADMIN':
      return 'Administrator';
    default:
      return role;
  }
}
