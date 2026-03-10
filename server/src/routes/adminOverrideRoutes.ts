import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/rbacMiddleware";
import {
  overrideComplaintStatusHandler,
  overrideQRStateHandler,
  forceAssignComplaintHandler,
  batchUpdateComplaintsHandler,
  getAdminActionHistoryHandler,
  undoActionHandler,
  triggerAutoEscalationHandler,
  getPendingMetricsHandler
} from "../controllers/adminOverrideController";

const adminOverrideRoutes = Router();

// All routes require ADMIN role
adminOverrideRoutes.use(requireAuth);
adminOverrideRoutes.use(requireRole("ADMIN"));

// Override complaint status (force any status)
adminOverrideRoutes.post("/override/complaint-status", overrideComplaintStatusHandler);

// Override QR state (bypass state machine)
adminOverrideRoutes.post("/override/qr-state", overrideQRStateHandler);

// Force assign complaint to recycler
adminOverrideRoutes.post("/override/assign-complaint", forceAssignComplaintHandler);

// Batch operations
adminOverrideRoutes.post("/batch/update-complaints", batchUpdateComplaintsHandler);

// Action history & undo
adminOverrideRoutes.get("/action-history", getAdminActionHistoryHandler);
adminOverrideRoutes.post("/undo-action", undoActionHandler);

// Auto-escalation controls
adminOverrideRoutes.post("/escalate-now", triggerAutoEscalationHandler);
adminOverrideRoutes.get("/pending-metrics", getPendingMetricsHandler);

export default adminOverrideRoutes;
