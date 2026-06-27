import type { User } from '@/types/auth';
import type { AdminUserRole } from '@/types/admin';
import {
  mapBackendRole,
  mapBackendUserToSessionUser,
} from '@/lib/api/mappers/backend-mappers';

export { mapBackendRole, mapBackendUserToSessionUser };

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
