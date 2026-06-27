import { Role } from '@prisma/client';

export const ROLES = Role;

export const ALL_ROLES: Role[] = [Role.FARMER, Role.BUYER, Role.ADMIN];

// Public registration is restricted to non-privileged roles.
export const PUBLIC_REGISTRATION_ROLES: Role[] = [Role.FARMER, Role.BUYER];
