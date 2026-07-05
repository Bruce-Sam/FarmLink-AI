import type { ApiMethod, ApiResponse } from '@/types/api';
import type { AuthSession } from '@/types/auth';
import type { PaginationMeta } from '@/types/api';
import {
  ADMIN_DEMO_CREDENTIALS,
  adminDemoAnalytics,
  adminDemoAuditLogs,
  adminDemoBuyers,
  adminDemoDashboard,
  adminDemoDemands,
  adminDemoFarmers,
  adminDemoListings,
  adminDemoMatches,
  adminDemoOffers,
  adminDemoTransactions,
  adminDemoTransport,
  adminDemoUser,
} from '@/mocks/admin-data';
import { mapBackendUserToSessionUser } from '@/lib/auth/admin-auth';
import { saveSession } from '@/lib/auth/session';

const DELAY = 450;

function delay(ms = DELAY): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function ok<T>(data: T, message?: string, meta?: PaginationMeta): ApiResponse<T> {
  return { data, message, meta };
}

function paginate<T>(items: T[], page = 1, limit = 20): { items: T[]; meta: PaginationMeta } {
  const total = items.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    meta: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
  };
}

function parseQuery(path: string): Record<string, string> {
  const idx = path.indexOf('?');
  if (idx === -1) return {};
  const params = new URLSearchParams(path.slice(idx));
  return Object.fromEntries(params.entries());
}

export async function handleAdminDemoRequest<T>(
  method: ApiMethod,
  path: string,
  body?: unknown,
): Promise<ApiResponse<T> | null> {
  const [basePath] = path.split('?');
  const query = parseQuery(path);

  if (basePath === '/auth/login' && method === 'POST') {
    await delay();
    const creds = body as { email?: string; identifier?: string; password?: string };
    const id = (creds.email ?? creds.identifier ?? '').trim().toLowerCase();
    if (
      id === ADMIN_DEMO_CREDENTIALS.email &&
      creds.password === ADMIN_DEMO_CREDENTIALS.password
    ) {
      const session: AuthSession = {
        user: mapBackendUserToSessionUser(adminDemoUser),
        accessToken: 'admin-demo-token',
      };
      saveSession(session, (body as { remember?: boolean }).remember);
      return ok({ user: adminDemoUser, accessToken: 'admin-demo-token' } as T, 'Admin login (demo)');
    }
    throw { message: 'Invalid administrator credentials', status: 401, code: 'UNAUTHORIZED' };
  }

  if (basePath === '/admin/dashboard' && method === 'GET') {
    await delay();
    return ok(adminDemoDashboard as T);
  }

  if (basePath === '/admin/analytics' && method === 'GET') {
    await delay();
    return ok(adminDemoAnalytics as T);
  }

  if (basePath === '/admin/users' && method === 'GET') {
    await delay();
    let users = [...adminDemoFarmers, ...adminDemoBuyers, adminDemoUser];
    if (query.role === 'FARMER') users = adminDemoFarmers;
    if (query.role === 'BUYER') users = adminDemoBuyers;
    if (query.search) {
      const s = query.search.toLowerCase();
      users = users.filter(
        (u) =>
          u.fullName.toLowerCase().includes(s) ||
          u.email?.toLowerCase().includes(s) ||
          u.phoneNumber.includes(s),
      );
    }
    const { items, meta } = paginate(users, Number(query.page) || 1, Number(query.limit) || 20);
    return ok({ users: items } as T, undefined, meta);
  }

  if (basePath.match(/^\/admin\/users\/[^/]+$/) && method === 'GET') {
    await delay();
    const id = basePath.split('/').pop()!;
    const user =
      [...adminDemoFarmers, ...adminDemoBuyers, adminDemoUser].find((u) => u.id === id) ??
      adminDemoFarmers.find((u) => u.farmerProfile?.id === id);
    if (!user) throw { message: 'User not found', status: 404 };
    return ok({ user } as T);
  }

  if (basePath.match(/^\/admin\/users\/[^/]+\/status$/) && method === 'PATCH') {
    await delay();
    const id = basePath.split('/')[3];
    const user = [...adminDemoFarmers, ...adminDemoBuyers].find((u) => u.id === id);
    if (!user) throw { message: 'User not found', status: 404 };
    const updated = { ...user, accountStatus: (body as { status: string }).status as typeof user.accountStatus };
    return ok({ user: updated } as T, 'Status updated (demo)');
  }

  if (basePath === '/admin/listings' && method === 'GET') {
    await delay();
    const { items, meta } = paginate(adminDemoListings, Number(query.page) || 1, Number(query.limit) || 20);
    return ok({ listings: items } as T, undefined, meta);
  }

  if (basePath.match(/^\/admin\/listings\/[^/]+$/) && method === 'GET') {
    await delay();
    const id = basePath.split('/').pop()!;
    const listing = adminDemoListings.find((l) => l.id === id);
    if (!listing) throw { message: 'Listing not found', status: 404 };
    return ok({ listing } as T);
  }

  if (basePath.match(/^\/admin\/listings\/[^/]+\/status$/) && method === 'PATCH') {
    await delay();
    const id = basePath.split('/')[3];
    const listing = adminDemoListings.find((l) => l.id === id);
    if (!listing) throw { message: 'Not found', status: 404 };
    return ok({ listing: { ...listing, status: (body as { status: string }).status } } as T);
  }

  if (basePath.match(/^\/admin\/listings\/[^/]+\/regenerate-matches$/) && method === 'POST') {
    await delay();
    return ok({ matchesGenerated: 3 } as T, 'Matches regenerated (demo)');
  }

  if (basePath === '/admin/offers' && method === 'GET') {
    await delay();
    const { items, meta } = paginate(adminDemoOffers, Number(query.page) || 1, Number(query.limit) || 20);
    return ok({ offers: items } as T, undefined, meta);
  }

  if (basePath === '/admin/transactions' && method === 'GET') {
    await delay();
    const { items, meta } = paginate(adminDemoTransactions, Number(query.page) || 1, Number(query.limit) || 20);
    return ok({ transactions: items } as T, undefined, meta);
  }

  if (basePath === '/admin/matches' && method === 'GET') {
    await delay();
    const { items, meta } = paginate(adminDemoMatches, Number(query.page) || 1, Number(query.limit) || 20);
    return ok({ matches: items } as T, undefined, meta);
  }

  if (basePath === '/admin/audit-logs' && method === 'GET') {
    await delay();
    const { items, meta } = paginate(adminDemoAuditLogs, Number(query.page) || 1, Number(query.limit) || 20);
    return ok({ auditLogs: items } as T, undefined, meta);
  }

  if (basePath === '/admin/demands' && method === 'GET') {
    await delay();
    return ok({ demands: adminDemoDemands } as T);
  }

  if (basePath === '/admin/transport-suggestions' && method === 'GET') {
    await delay();
    return ok({ suggestions: adminDemoTransport } as T);
  }

  return null;
}
