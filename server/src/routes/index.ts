import { Router } from "express";
import authRoutes from "./authRoutes";
import productRoutes from "./productRoutes";
import qrRoutes from "./qrRoutes";
import recyclingRoutes from "./recyclingRoutes";
import dashboardRoutes from "./dashboardRoutes";
import notificationRoutes from "./notificationRoutes";
import complaintRoutes from "./complaintRoutes";
import adminOverrideRoutes from "./adminOverrideRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/qr", qrRoutes);
router.use("/recycling", recyclingRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/notifications", notificationRoutes);
router.use("/complaints", complaintRoutes);
router.use("/admin", adminOverrideRoutes);

export default router;

