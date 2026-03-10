import type { RequestHandler } from "express";
import type { Role } from "../types/role";
import { AppError } from "../utils/errors";

export function requireRole(...rolesOrArray: (Role | Role[])[]): RequestHandler {
  const roles: Role[] = ([] as Role[]).concat(...rolesOrArray as any);
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401, "AUTH_REQUIRED"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }
    next();
  };
}

