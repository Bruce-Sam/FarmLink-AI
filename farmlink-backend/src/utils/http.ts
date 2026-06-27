import { type Request } from 'express';

// Express 5 types route params as `string | string[]` (wildcard segments can be
// arrays). For our single-value :params this safely returns the first string.
export function getParam(req: Request, key: string): string {
  const value = req.params[key];
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}
