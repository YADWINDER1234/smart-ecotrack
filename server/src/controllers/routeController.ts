import type { RequestHandler } from "express";
import { getCollectionPlan } from "../services/routeOptimizationService";

export const getOptimizedRouteHandler: RequestHandler = async (req, res, next) => {
  try {
    const threshold = req.query.threshold ? Number(req.query.threshold) : 70;
    const plan = await getCollectionPlan(threshold);
    res.json(plan);
  } catch (err) {
    next(err);
  }
};

export const getCollectionPlanHandler: RequestHandler = async (_req, res, next) => {
  try {
    const plan = await getCollectionPlan();
    res.json(plan);
  } catch (err) {
    next(err);
  }
};
