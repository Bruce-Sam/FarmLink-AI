import { type Request, type Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { successResponse, buildPaginationMeta } from '../../utils/api-response';
import { ApiError } from '../../utils/api-error';
import { getParam } from '../../utils/http';
import { offersService } from './offers.service';
import { createOfferSchema, offerListQuerySchema } from './offers.schema';

function requireUserId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

// ----- Buyer -----

export const createOffer = asyncHandler(async (req: Request, res: Response) => {
  const input = createOfferSchema.parse(req.body);
  const offer = await offersService.createOffer(requireUserId(req), input);
  successResponse(res, { statusCode: 201, message: 'Offer sent successfully', data: { offer } });
});

export const listBuyerOffers = asyncHandler(async (req: Request, res: Response) => {
  const query = offerListQuerySchema.parse(req.query);
  const { items, total } = await offersService.listBuyerOffers(requireUserId(req), query);
  successResponse(res, {
    message: 'Offers retrieved',
    data: { offers: items },
    meta: buildPaginationMeta(total, query.page, query.limit),
  });
});

export const getBuyerOffer = asyncHandler(async (req: Request, res: Response) => {
  const offer = await offersService.getBuyerOffer(requireUserId(req), getParam(req, 'offerId'));
  successResponse(res, { message: 'Offer retrieved', data: { offer } });
});

export const cancelOffer = asyncHandler(async (req: Request, res: Response) => {
  const offer = await offersService.cancelOffer(requireUserId(req), getParam(req, 'offerId'));
  successResponse(res, { message: 'Offer cancelled', data: { offer } });
});

export const listBuyerTransactions = asyncHandler(async (req: Request, res: Response) => {
  const transactions = await offersService.listBuyerTransactions(requireUserId(req));
  successResponse(res, { message: 'Transactions retrieved', data: { transactions } });
});

export const getBuyerTransaction = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await offersService.getBuyerTransaction(
    requireUserId(req),
    getParam(req, 'transactionId'),
  );
  successResponse(res, { message: 'Transaction retrieved', data: { transaction } });
});

// ----- Farmer -----

export const listFarmerOffers = asyncHandler(async (req: Request, res: Response) => {
  const query = offerListQuerySchema.parse(req.query);
  const { items, total } = await offersService.listFarmerOffers(requireUserId(req), query);
  successResponse(res, {
    message: 'Offers retrieved',
    data: { offers: items },
    meta: buildPaginationMeta(total, query.page, query.limit),
  });
});

export const getFarmerOffer = asyncHandler(async (req: Request, res: Response) => {
  const offer = await offersService.getFarmerOffer(requireUserId(req), getParam(req, 'offerId'));
  successResponse(res, { message: 'Offer retrieved', data: { offer } });
});

export const acceptOffer = asyncHandler(async (req: Request, res: Response) => {
  const result = await offersService.acceptOffer(requireUserId(req), getParam(req, 'offerId'));
  successResponse(res, { message: 'Offer accepted and transaction created', data: result });
});

export const rejectOffer = asyncHandler(async (req: Request, res: Response) => {
  const offer = await offersService.rejectOffer(requireUserId(req), getParam(req, 'offerId'));
  successResponse(res, { message: 'Offer rejected', data: { offer } });
});

export const listFarmerTransactions = asyncHandler(async (req: Request, res: Response) => {
  const transactions = await offersService.listFarmerTransactions(requireUserId(req));
  successResponse(res, { message: 'Transactions retrieved', data: { transactions } });
});

export const getFarmerTransaction = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await offersService.getFarmerTransaction(
    requireUserId(req),
    getParam(req, 'transactionId'),
  );
  successResponse(res, { message: 'Transaction retrieved', data: { transaction } });
});
