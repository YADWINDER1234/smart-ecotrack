import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../utils/errors";

export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const formErrors = parsed.error.flatten().formErrors;
      const errors = [
        ...formErrors,
        ...Object.entries(fieldErrors).map(([field, msgs]) => `${field}: ${(msgs as string[])?.join(", ")}`)
      ];
      
      return next(
        new AppError(errors.join("; ") || "Validation failed", 400, "VALIDATION_ERROR")
      );
    }
    req.body = parsed.data as any;
    next();
  };
}

