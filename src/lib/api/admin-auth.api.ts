import { apiPost } from './client';
import type { AuthSession } from '@/types/auth';
import type { AdminUser } from '@/types/admin';
import { mapBackendUserToSessionUser, isAdminUser } from '@/lib/auth/admin-auth';
import { saveSession } from '@/lib/auth/session';

interface BackendLoginResponse {
  user: AdminUser;
  accessToken: string;
}

export interface AdminLoginInput {
  identifier: string;
  password: string;
  remember?: boolean;
}

export async function adminLogin(input: AdminLoginInput): Promise<AuthSession> {
  const isEmail = input.identifier.includes('@');
  const res = await apiPost<BackendLoginResponse>('/auth/login', {
    ...(isEmail ? { email: input.identifier.trim() } : { identifier: input.identifier.trim() }),
    password: input.password,
  });

  const sessionUser = mapBackendUserToSessionUser(res.data.user);
  if (!isAdminUser(sessionUser)) {
    throw {
      message: 'Access denied. Administrator credentials required.',
      code: 'FORBIDDEN',
      status: 403,
    };
  }

  const session: AuthSession = {
    user: sessionUser,
    accessToken: res.data.accessToken,
  };
  saveSession(session, input.remember);
  return session;
}
