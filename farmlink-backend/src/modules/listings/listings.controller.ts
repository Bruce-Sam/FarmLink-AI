import { type Request, type Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { successResponse, buildPaginationMeta } from '../../utils/api-response';
import { ApiError } from '../../utils/api-error';
import { getParam } from '../../utils/http';
import { prisma } from '../../config/database';
import { listingsService } from './listings.service';
import {
  createListingSchema,
  extractSchema,
  marketplaceQuerySchema,
  myListingsQuerySchema,
  updateListingSchema,
} from './listings.schema';

function requireUserId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

export const extractListing = asyncHandler(async (req: Request, res: Response) => {
  const input = extractSchema.parse(req.body);
  const extraction = await listingsService.extract(input);
  successResponse(res, { message: 'Produce details extracted', data: { extraction } });
});

export const createListing = asyncHandler(async (req: Request, res: Response) => {
  const input = createListingSchema.parse(req.body);
  const listing = await listingsService.create(requireUserId(req), input);
  successResponse(res, {
    statusCode: 201,
    message: 'Produce listing created successfully',
    data: { listing },
  });
});

export const getMyListings = asyncHandler(async (req: Request, res: Response) => {
  const query = myListingsQuerySchema.parse(req.query);
  const { items, total } = await listingsService.listMy(requireUserId(req), query);
  successResponse(res, {
    message: 'Listings retrieved',
    data: { listings: items },
    meta: buildPaginationMeta(total, query.page, query.limit),
  });
});

export const getListingById = asyncHandler(async (req: Request, res: Response) => {
  const listing = await listingsService.getOwn(requireUserId(req), getParam(req, 'listingId'));
  successResponse(res, { message: 'Listing retrieved', data: { listing } });
});

export const updateListing = asyncHandler(async (req: Request, res: Response) => {
  const input = updateListingSchema.parse(req.body);
  const listing = await listingsService.update(requireUserId(req), getParam(req, 'listingId'), input);
  successResponse(res, { message: 'Listing updated', data: { listing } });
});

export const publishListing = asyncHandler(async (req: Request, res: Response) => {
  const result = await listingsService.publish(requireUserId(req), getParam(req, 'listingId'));
  successResponse(res, { message: 'Listing published and matches generated', data: result });
});

export const cancelListing = asyncHandler(async (req: Request, res: Response) => {
  const listing = await listingsService.cancel(requireUserId(req), getParam(req, 'listingId'));
  successResponse(res, { message: 'Listing cancelled', data: { listing } });
});

export const getListingMatches = asyncHandler(async (req: Request, res: Response) => {
  const matches = await listingsService.getMatches(requireUserId(req), getParam(req, 'listingId'));
  successResponse(res, { message: 'Listing matches retrieved', data: { matches } });
});

// ----- Marketplace (browse published listings) -----

async function resolveBuyerCoords(userId: string, role: string) {
  if (role !== 'BUYER') return null;
  const profile = await prisma.buyerProfile.findUnique({
    where: { userId },
    select: { latitude: true, longitude: true },
  });
  return profile ? { latitude: profile.latitude, longitude: profile.longitude } : null;
}

export const browseMarketplace = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const query = marketplaceQuerySchema.parse(req.query);
  const coords = await resolveBuyerCoords(req.user.id, req.user.role);
  const { items, total } = await listingsService.marketplace(query, coords);
  successResponse(res, {
    message: 'Marketplace listings retrieved',
    data: { listings: items },
    meta: buildPaginationMeta(total, query.page, query.limit),
  });
});

export const getMarketplaceListing = asyncHandler(async (req: Request, res: Response) => {
  const listing = await listingsService.getPublicById(getParam(req, 'listingId'));
  successResponse(res, { message: 'Listing retrieved', data: { listing } });
});
