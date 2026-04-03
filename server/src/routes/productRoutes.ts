import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/rbacMiddleware";
import { validateBody } from "../middleware/validation";
import {
  createProductHandler,
  createProductSchema,
  getProductHandler,
  listProductsHandler
} from "../controllers/productController";

const router = Router();

router.get("/", requireAuth, listProductsHandler);
router.get("/:id", requireAuth, getProductHandler);

// Public logging for identified products
router.post(
  "/",
  requireAuth,
  validateBody(createProductSchema),
  createProductHandler
);

router.post(
  "/admin",
  requireAuth,
  requireRole("ADMIN", "MANUFACTURER"),
  validateBody(createProductSchema),
  createProductHandler
);

export default router;

