import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ValidationError } from "../common/errors/index.js";

// Generic Zod validation middleware.
// Validates request body, params, or query against the provided schema.
// Returns a 400 ValidationError with field-level details on failure.

interface ValidationSchemas {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
}

export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        const fieldErrors = result.error.issues.map(
          (issue) => `${issue.path.join(".")}: ${issue.message}`,
        );
        errors.push(...fieldErrors);
      } else {
        req.body = result.data;
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        const fieldErrors = result.error.issues.map(
          (issue) => `${issue.path.join(".")}: ${issue.message}`,
        );
        errors.push(...fieldErrors);
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        const fieldErrors = result.error.issues.map(
          (issue) => `${issue.path.join(".")}: ${issue.message}`,
        );
        errors.push(...fieldErrors);
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join("; "));
    }

    next();
  };
};
