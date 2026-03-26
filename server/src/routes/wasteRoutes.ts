import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import {
  classifyWasteHandler,
  detectFromCameraHandler,
  getDisposalGuideHandler
} from "../controllers/wasteController";

const router = Router();

// Classify waste from product data
router.post("/classify", requireAuth, classifyWasteHandler);

// AI camera-based detection
router.post("/detect", requireAuth, detectFromCameraHandler);

// Get disposal guide for a waste type
router.get("/disposal-guide/:wasteType", getDisposalGuideHandler);

export default router;
