import { type NextFunction, type Request, type Response } from 'express';
import { type ZodTypeAny, ZodError } from 'zod';
import { ApiError } from '../utils/api-error';

interface ValidationSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
}

export function formatZodIssues(error: ZodError): Array<{ path: string; message: string }> {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

// Validates request body / params and replaces them with parsed values.
// NOTE: Express 5 exposes req.query as a read-only getter, so query strings
// are parsed inside controllers with their own Zod schemas instead.
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        const parsed = schemas.params.parse(req.params);
        Object.assign(req.params, parsed);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(ApiError.validation('Validation failed', formatZodIssues(error)));
        return;
      }
      next(error);
    }
  };
}
