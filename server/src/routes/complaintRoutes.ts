import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/rbacMiddleware";
import {
  createComplaintHandler,
  listOpenComplaintsHandler,
  assignComplaintHandler,
  updateComplaintHandler,
  getComplaintHandler,
  listMyComplaintsHandler,
  listRecyclerComplaintsHandler
} from "../controllers/complaintController";

const router = Router();

router.post("/", requireAuth, createComplaintHandler);

// Consumer listing
router.get("/my", requireAuth, requireRole("CONSUMER"), listMyComplaintsHandler);

// Recycler listing
router.get("/recycler/open", requireAuth, requireRole("RECYCLER"), listRecyclerComplaintsHandler);
router.post("/recycler/:id/status", requireAuth, requireRole("RECYCLER"), updateComplaintHandler);

// Admin listing and management
router.get("/admin/open", requireAuth, requireRole("ADMIN"), listOpenComplaintsHandler);
router.post("/admin/:id/assign", requireAuth, requireRole("ADMIN"), assignComplaintHandler);
router.post("/admin/:id/status", requireAuth, requireRole("ADMIN"), updateComplaintHandler);

router.get("/:id", requireAuth, getComplaintHandler);

export default router;
