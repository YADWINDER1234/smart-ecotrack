import type { RequestHandler } from "express";
import { getAdminDashboard } from "../services/analyticsService";
import { findUserById } from "../repos/userRepo";
import { AppError } from "../utils/errors";

export const adminDashboardHandler: RequestHandler = async (_req, res, next) => {
  try {
    const dashboard = await getAdminDashboard();
    res.json(dashboard);
  } catch (err) {
    next(err);
  }
};

export const manufacturerDashboardHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = await findUserById(req.user!.id);
    if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
    const dashboard = await getAdminDashboard(user.name);
    res.json(dashboard);
  } catch (err) {
    next(err);
  }
};

