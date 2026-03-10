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

router.post(
  "/admin",
  requireAuth,
  requireRole("ADMIN", "MANUFACTURER"),
  validateBody(createProductSchema),
  createProductHandler
);

export default router;

