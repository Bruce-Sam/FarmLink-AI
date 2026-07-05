export type RatedRole = 'farmer' | 'buyer';

export interface PartnerRating {
  id: string;
  transactionId: string;
  raterUserId: string;
  raterName?: string;
  ratedUserId: string;
  ratedRole: RatedRole;
  score: number;
  comment?: string;
  createdAt: string;
}

export interface RatingSummary {
  averageScore: number;
  totalRatings: number;
  recentRatings: PartnerRating[];
}

export interface TransactionRatingContext {
  ratings: PartnerRating[];
  myRating: PartnerRating | null;
  canRate: boolean;
  targetRole: RatedRole;
}

export interface CreateRatingPayload {
  transactionId: string;
  targetRole: RatedRole;
  score: number;
  comment?: string;
}
