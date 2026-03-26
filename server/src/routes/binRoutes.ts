import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/rbacMiddleware";
import {
  listBinsHandler,
  getBinHandler,
  createBinHandler,
  ingestSensorDataHandler,
  getBinStatsHandler,
  getOverflowPredictionHandler
} from "../controllers/binController";

const router = Router();

// Stats endpoint (must be before :id to avoid conflict)
router.get("/stats", requireAuth, getBinStatsHandler);

// List all bins
router.get("/", requireAuth, listBinsHandler);

// Get single bin
router.get("/:id", requireAuth, getBinHandler);

// Create bin (admin only)
router.post("/", requireAuth, requireRole("ADMIN"), createBinHandler);

// IoT sensor data ingestion (no auth — uses API key in production)
router.post("/:id/sensor", ingestSensorDataHandler);

// Overflow prediction
router.get("/:id/predict", requireAuth, getOverflowPredictionHandler);

export default router;
