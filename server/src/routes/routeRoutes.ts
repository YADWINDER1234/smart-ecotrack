import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import {
  getOptimizedRouteHandler,
  getCollectionPlanHandler
} from "../controllers/routeController";

const router = Router();

// Get optimized collection route
router.get("/optimize", requireAuth, getOptimizedRouteHandler);

// Get auto-generated collection plan
router.get("/collection-plan", requireAuth, getCollectionPlanHandler);

export default router;
