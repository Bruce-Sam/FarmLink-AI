import { apiGet, apiPost } from './client';
import type { AuthSession, LoginCredentials, PortalRole, RegisterPayload, User } from '@/types/auth';
import { getSession, saveSession, clearSession } from '@/lib/auth/session';
import { getRememberPreference } from '@/lib/auth/token-storage';
import { config } from '@/lib/config';
import {
  mapBackendUserToSessionUser,
  toBackendRole,
  type BackendSafeUser,
} from './mappers/backend-mappers';

function toAuthSession(data: { user: BackendSafeUser; accessToken: string }): AuthSession {
  return {
    user: mapBackendUserToSessionUser(data.user),
    accessToken: data.accessToken,
  };
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const response = await apiPost<{ user: BackendSafeUser; accessToken: string }>('/auth/login', {
    identifier: credentials.email,
    password: credentials.password,
  });
  const session = toAuthSession(response.data);
  saveSession(session, credentials.remember);
  return session;
}

export async function register(payload: RegisterPayload): Promise<AuthSession> {
  const response = await apiPost<{ user: BackendSafeUser; accessToken: string }>('/auth/register', {
    fullName: payload.fullName,
    phoneNumber: payload.phone ?? payload.email,
    email: payload.email,
    password: payload.password,
    role: toBackendRole(payload.role),
  });
  const session = toAuthSession(response.data);
  saveSession(session);
  return session;
}

export async function addPortalRole(_role: PortalRole): Promise<User> {
  if (!config.isDemoMode) {
    throw new Error(
      'Each Afuo Market account has one role. Create a separate account to access another portal.',
    );
  }
  const response = await apiPost<User>('/auth/add-role', { role: _role });
  const session = getSession();
  if (session) {
    saveSession({ ...session, user: response.data }, getRememberPreference());
  }
  return response.data;
}

export async function switchPortal(_portalRole: PortalRole): Promise<User> {
  if (!config.isDemoMode) {
    throw new Error(
      'Each Afuo Market account has one role. Sign in with the account for that portal.',
    );
  }
  const response = await apiPost<User>('/auth/switch-portal', { portalRole: _portalRole });
  const session = getSession();
  if (session) {
    saveSession({ ...session, user: response.data }, getRememberPreference());
  }
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiGet<{ user: BackendSafeUser }>('/auth/me');
  return mapBackendUserToSessionUser(response.data.user);
}

export async function logout(): Promise<void> {
  try {
    await apiPost<void>('/auth/logout');
  } finally {
    clearSession();
  }
}
