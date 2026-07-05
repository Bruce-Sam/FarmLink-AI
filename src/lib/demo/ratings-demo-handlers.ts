import type {
  CreateRatingPayload,
  PartnerRating,
  RatingSummary,
  TransactionRatingContext,
} from '@/types/rating';
import {
  DEMO_FARMER_ID,
  DEMO_USER_ID,
} from './demo-data';
import { DEMO_BUYER_ID, DEMO_BUYER_USER_ID } from './buyer-demo-data';

const now = new Date().toISOString();
const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

export const DEMO_FARMER_TXN_ID = 'txn-001';
export const DEMO_BUYER_TXN_ID = 'buyer-txn-001';

let mutableRatings: PartnerRating[] = [
  {
    id: 'rating-001',
    transactionId: 'txn-prev-002',
    raterUserId: 'user-kumasi-wholesale',
    raterName: 'Kumasi Wholesale Depot',
    ratedUserId: DEMO_USER_ID,
    ratedRole: 'farmer',
    score: 5,
    comment: 'Reliable harvest quality and on-time pickup.',
    createdAt: weekAgo,
  },
  {
    id: 'rating-002',
    transactionId: 'txn-prev-002',
    raterUserId: DEMO_USER_ID,
    raterName: 'Kwame Mensah',
    ratedUserId: 'user-kumasi-wholesale',
    ratedRole: 'buyer',
    score: 4,
    comment: 'Clear communication and fair pricing.',
    createdAt: weekAgo,
  },
  {
    id: 'rating-003',
    transactionId: 'buyer-txn-prev-001',
    raterUserId: DEMO_USER_ID,
    raterName: 'Kwame Mensah',
    ratedUserId: DEMO_BUYER_USER_ID,
    ratedRole: 'buyer',
    score: 5,
    comment: 'Professional buyer — pickup was smooth.',
    createdAt: weekAgo,
  },
];

function buildSummary(userId: string): RatingSummary {
  const received = mutableRatings.filter((rating) => rating.ratedUserId === userId);
  const averageScore =
    received.length > 0
      ? received.reduce((sum, rating) => sum + rating.score, 0) / received.length
      : 0;

  return {
    averageScore,
    totalRatings: received.length,
    recentRatings: [...received]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5),
  };
}

function resolveUserIdForFarmer(farmerProfileId: string): string | null {
  if (farmerProfileId === DEMO_FARMER_ID) return DEMO_USER_ID;
  return null;
}

function resolveUserIdForBuyer(buyerProfileId: string): string | null {
  if (buyerProfileId === DEMO_BUYER_ID) return DEMO_BUYER_USER_ID;
  return null;
}

function getTransactionContext(
  transactionId: string,
  currentUserId: string,
): TransactionRatingContext | null {
  const isFarmerTxn = transactionId === DEMO_FARMER_TXN_ID;
  const isBuyerTxn = transactionId === DEMO_BUYER_TXN_ID;
  if (!isFarmerTxn && !isBuyerTxn) return null;

  const ratings = mutableRatings.filter((rating) => rating.transactionId === transactionId);
  const myRating = ratings.find((rating) => rating.raterUserId === currentUserId) ?? null;
  const isFarmer = currentUserId === DEMO_USER_ID;
  const isBuyer = currentUserId === DEMO_BUYER_USER_ID;

  if (!isFarmer && !isBuyer) {
    return {
      ratings,
      myRating,
      canRate: false,
      targetRole: 'buyer',
    };
  }

  return {
    ratings,
    myRating,
    canRate: !myRating,
    targetRole: isFarmer ? 'buyer' : 'farmer',
  };
}

export function handleRatingsDemoRequest<T>(
  method: string,
  normalizedPath: string,
  body: unknown,
  currentUserId?: string,
): { data: T; message?: string } | null {
  const userSummaryMatch = matchPath(normalizedPath, '/ratings/users/:userId/summary');
  if (userSummaryMatch && method === 'GET') {
    return {
      data: { summary: buildSummary(userSummaryMatch[1]!) } as T,
      message: 'Rating summary retrieved (demo mode)',
    };
  }

  const farmerSummaryMatch = matchPath(normalizedPath, '/ratings/farmers/:farmerId/summary');
  if (farmerSummaryMatch && method === 'GET') {
    const userId = resolveUserIdForFarmer(farmerSummaryMatch[1]!);
    if (!userId) return { data: { summary: buildSummary('unknown') } as T };
    return {
      data: { summary: buildSummary(userId) } as T,
      message: 'Farmer rating summary retrieved (demo mode)',
    };
  }

  const buyerSummaryMatch = matchPath(normalizedPath, '/ratings/buyers/:buyerId/summary');
  if (buyerSummaryMatch && method === 'GET') {
    const userId = resolveUserIdForBuyer(buyerSummaryMatch[1]!);
    if (!userId) return { data: { summary: buildSummary('unknown') } as T };
    return {
      data: { summary: buildSummary(userId) } as T,
      message: 'Buyer rating summary retrieved (demo mode)',
    };
  }

  const transactionMatch = matchPath(normalizedPath, '/ratings/transactions/:transactionId');
  if (transactionMatch && method === 'GET') {
    const context = getTransactionContext(transactionMatch[1]!, currentUserId ?? '');
    if (!context) {
      throw { message: 'Transaction not found', code: 'NOT_FOUND', status: 404 };
    }
    return {
      data: context as T,
      message: 'Transaction ratings retrieved (demo mode)',
    };
  }

  if (normalizedPath === '/ratings' && method === 'POST') {
    const payload = body as CreateRatingPayload;
    if (!currentUserId) {
      throw { message: 'Unauthorized', code: 'UNAUTHORIZED', status: 401 };
    }

    const context = getTransactionContext(payload.transactionId, currentUserId);
    if (!context?.canRate) {
      throw {
        message: context?.myRating ? 'You have already rated this transaction' : 'Cannot rate this transaction',
        code: 'BAD_REQUEST',
        status: 400,
      };
    }

    const ratedUserId =
      payload.targetRole === 'farmer'
        ? DEMO_USER_ID
        : payload.transactionId === DEMO_BUYER_TXN_ID
          ? DEMO_BUYER_USER_ID
          : 'user-kumasi-wholesale';

    const rating: PartnerRating = {
      id: `rating-${Date.now()}`,
      transactionId: payload.transactionId,
      raterUserId: currentUserId,
      raterName: currentUserId === DEMO_USER_ID ? 'Kwame Mensah' : 'Golden Spoon Restaurant',
      ratedUserId,
      ratedRole: payload.targetRole,
      score: payload.score,
      comment: payload.comment,
      createdAt: now,
    };

    mutableRatings = [...mutableRatings, rating];
    return {
      data: { rating } as T,
      message: 'Rating submitted (demo mode)',
    };
  }

  return null;
}

function matchPath(path: string, pattern: string): RegExpMatchArray | null {
  const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, '([^/]+)')}$`);
  return path.match(regex);
}

export function resetRatingsDemoState(): void {
  mutableRatings = [];
}
