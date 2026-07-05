import { apiGet, apiPatch, apiPost } from './client';
import type { PaginationMeta } from '@/types/api';

function asPaginationMeta(
  meta: PaginationMeta | Record<string, unknown> | undefined | null,
): PaginationMeta | null {
  if (!meta || typeof meta !== 'object' || !('page' in meta) || !('total' in meta)) {
    return null;
  }
  return meta as PaginationMeta;
}
import type {
  AdminAnalytics,
  AdminAuditLog,
  AdminDashboardOverview,
  AdminDemand,
  AdminGenericQuery,
  AdminListing,
  AdminListingsQuery,
  AdminMatch,
  AdminOffer,
  AdminTransaction,
  AdminTransportSuggestion,
  AdminUser,
  AdminUsersQuery,
} from '@/types/admin';

function toQuery(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export async function getDashboard(): Promise<AdminDashboardOverview> {
  const res = await apiGet<AdminDashboardOverview>('/admin/dashboard');
  return res.data;
}

export async function getAnalytics(): Promise<AdminAnalytics> {
  const res = await apiGet<AdminAnalytics>('/admin/analytics');
  return res.data;
}

export async function listUsers(
  query: AdminUsersQuery = {},
): Promise<{ users: AdminUser[]; meta: PaginationMeta | null }> {
  const res = await apiGet<{ users: AdminUser[] }>(`/admin/users${toQuery(query)}`);
  return { users: res.data.users, meta: asPaginationMeta(res.meta) };
}

export async function getUser(userId: string): Promise<AdminUser> {
  const res = await apiGet<{ user: AdminUser }>(`/admin/users/${userId}`);
  return res.data.user;
}

export async function updateUserStatus(
  userId: string,
  status: string,
): Promise<AdminUser> {
  const res = await apiPatch<{ user: AdminUser }>(`/admin/users/${userId}/status`, { status });
  return res.data.user;
}

export async function listListings(
  query: AdminListingsQuery = {},
): Promise<{ listings: AdminListing[]; meta: PaginationMeta | null }> {
  const res = await apiGet<{ listings: AdminListing[] }>(`/admin/listings${toQuery(query)}`);
  return { listings: res.data.listings, meta: asPaginationMeta(res.meta) };
}

export async function getListing(listingId: string): Promise<AdminListing> {
  const res = await apiGet<{ listing: AdminListing }>(`/admin/listings/${listingId}`);
  return res.data.listing;
}

export async function updateListingStatus(
  listingId: string,
  status: string,
): Promise<AdminListing> {
  const res = await apiPatch<{ listing: AdminListing }>(
    `/admin/listings/${listingId}/status`,
    { status },
  );
  return res.data.listing;
}

export async function regenerateMatches(
  listingId: string,
): Promise<{ matchesGenerated: number }> {
  const res = await apiPost<{ matchesGenerated: number }>(
    `/admin/listings/${listingId}/regenerate-matches`,
  );
  return res.data;
}

export async function listOffers(
  query: AdminGenericQuery = {},
): Promise<{ offers: AdminOffer[]; meta: PaginationMeta | null }> {
  const res = await apiGet<{ offers: AdminOffer[] }>(`/admin/offers${toQuery(query)}`);
  return { offers: res.data.offers, meta: asPaginationMeta(res.meta) };
}

export async function listTransactions(
  query: AdminGenericQuery = {},
): Promise<{ transactions: AdminTransaction[]; meta: PaginationMeta | null }> {
  const res = await apiGet<{ transactions: AdminTransaction[] }>(
    `/admin/transactions${toQuery(query)}`,
  );
  return { transactions: res.data.transactions, meta: asPaginationMeta(res.meta) };
}

export async function listMatches(
  query: AdminGenericQuery = {},
): Promise<{ matches: AdminMatch[]; meta: PaginationMeta | null }> {
  const res = await apiGet<{ matches: AdminMatch[] }>(`/admin/matches${toQuery(query)}`);
  return { matches: res.data.matches, meta: asPaginationMeta(res.meta) };
}

export async function listAuditLogs(
  query: AdminGenericQuery = {},
): Promise<{ auditLogs: AdminAuditLog[]; meta: PaginationMeta | null }> {
  const res = await apiGet<{ auditLogs: AdminAuditLog[] }>(`/admin/audit-logs${toQuery(query)}`);
  return { auditLogs: res.data.auditLogs, meta: asPaginationMeta(res.meta) };
}

/** Demands and transport suggestions from the live admin API. */
export async function listDemands(): Promise<AdminDemand[]> {
  const res = await apiGet<{ demands: AdminDemand[] }>('/admin/demands');
  return res.data.demands;
}

export async function listTransportSuggestions(): Promise<AdminTransportSuggestion[]> {
  const res = await apiGet<{ suggestions: AdminTransportSuggestion[] }>(
    '/admin/transport-suggestions',
  );
  return res.data.suggestions;
}
