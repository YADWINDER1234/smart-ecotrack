import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../utils/errors";

export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        new AppError(parsed.error.flatten().formErrors.join("; "), 400, "VALIDATION_ERROR")
      );
    }
    req.body = parsed.data as any;
    next();
  };
}

