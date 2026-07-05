import { type Request, type Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { successResponse, buildPaginationMeta } from '../../utils/api-response';
import { ApiError } from '../../utils/api-error';
import { getParam } from '../../utils/http';
import { adminService } from './admin.service';
import { dashboardService } from '../dashboard/dashboard.service';
import {
  adminGenericQuerySchema,
  adminListingsQuerySchema,
  adminUsersQuerySchema,
  updateListingStatusSchema,
  updateUserStatusSchema,
} from './admin.schema';

function requireAdminId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const overview = await dashboardService.adminOverview();
  successResponse(res, { message: 'Dashboard metrics retrieved', data: overview });
});

export const getAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const analytics = await dashboardService.adminAnalytics();
  successResponse(res, { message: 'Platform analytics retrieved', data: analytics });
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = adminUsersQuerySchema.parse(req.query);
  const { items, total } = await adminService.listUsers(query);
  successResponse(res, {
    message: 'Users retrieved',
    data: { users: items },
    meta: buildPaginationMeta(total, query.page, query.limit),
  });
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.getUser(getParam(req, 'userId'));
  successResponse(res, { message: 'User retrieved', data: { user } });
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = updateUserStatusSchema.parse(req.body);
  const user = await adminService.updateUserStatus(requireAdminId(req), getParam(req, 'userId'), status);
  successResponse(res, { message: 'User status updated', data: { user } });
});

export const listListings = asyncHandler(async (req: Request, res: Response) => {
  const query = adminListingsQuerySchema.parse(req.query);
  const { items, total } = await adminService.listListings(query);
  successResponse(res, {
    message: 'Listings retrieved',
    data: { listings: items },
    meta: buildPaginationMeta(total, query.page, query.limit),
  });
});

export const getListing = asyncHandler(async (req: Request, res: Response) => {
  const listing = await adminService.getListing(getParam(req, 'listingId'));
  successResponse(res, { message: 'Listing retrieved', data: { listing } });
});

export const updateListingStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = updateListingStatusSchema.parse(req.body);
  const listing = await adminService.updateListingStatus(
    requireAdminId(req),
    getParam(req, 'listingId'),
    status,
  );
  successResponse(res, { message: 'Listing status updated', data: { listing } });
});

export const listOffers = asyncHandler(async (req: Request, res: Response) => {
  const query = adminGenericQuerySchema.parse(req.query);
  const { items, total } = await adminService.listOffers(query);
  successResponse(res, {
    message: 'Offers retrieved',
    data: { offers: items },
    meta: buildPaginationMeta(total, query.page, query.limit),
  });
});

export const listTransactions = asyncHandler(async (req: Request, res: Response) => {
  const query = adminGenericQuerySchema.parse(req.query);
  const { items, total } = await adminService.listTransactions(query);
  successResponse(res, {
    message: 'Transactions retrieved',
    data: { transactions: items },
    meta: buildPaginationMeta(total, query.page, query.limit),
  });
});

export const listMatches = asyncHandler(async (req: Request, res: Response) => {
  const query = adminGenericQuerySchema.parse(req.query);
  const { items, total } = await adminService.listMatches(query);
  successResponse(res, {
    message: 'Matches retrieved',
    data: { matches: items },
    meta: buildPaginationMeta(total, query.page, query.limit),
  });
});

export const regenerateMatches = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.regenerateMatches(requireAdminId(req), getParam(req, 'listingId'));
  successResponse(res, { message: 'Matches regenerated', data: result });
});

export const listAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const query = adminGenericQuerySchema.parse(req.query);
  const { items, total } = await adminService.listAuditLogs(query);
  successResponse(res, {
    message: 'Audit logs retrieved',
    data: { auditLogs: items },
    meta: buildPaginationMeta(total, query.page, query.limit),
  });
});

export const listDemands = asyncHandler(async (_req: Request, res: Response) => {
  const demands = await adminService.listDemands();
  successResponse(res, { message: 'Demands retrieved', data: { demands } });
});

export const listTransportSuggestions = asyncHandler(async (_req: Request, res: Response) => {
  const suggestions = await adminService.listTransportSuggestions();
  successResponse(res, { message: 'Transport suggestions retrieved', data: { suggestions } });
});
