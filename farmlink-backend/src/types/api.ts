import { type PaginationMeta } from '../utils/api-response';

export interface ApiErrorBody {
  success: false;
  message: string;
  error: {
    code: string;
    details?: unknown;
  };
  requestId: string;
}

export type { PaginationMeta };

export interface ListResult<T> {
  items: T[];
  total: number;
}
