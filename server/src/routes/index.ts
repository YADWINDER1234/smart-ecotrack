import { Router } from "express";
import authRoutes from "./authRoutes";
import productRoutes from "./productRoutes";
import qrRoutes from "./qrRoutes";
import recyclingRoutes from "./recyclingRoutes";
import dashboardRoutes from "./dashboardRoutes";
import binRoutes from "./binRoutes";
import blockchainRoutes from "./blockchainRoutes";
import complaintRoutes from "./complaintRoutes";
import rewardRoutes from "./rewardRoutes";
import routeRoutes from "./routeRoutes";
import wasteRoutes from "./wasteRoutes";
import notificationRoutes from "./notificationRoutes";
import adminOverrideRoutes from "./adminOverrideRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/qr", qrRoutes);
router.use("/recycling", recyclingRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/bins", binRoutes);
router.use("/blockchain", blockchainRoutes);
router.use("/complaints", complaintRoutes);
router.use("/rewards", rewardRoutes);
router.use("/routes", routeRoutes);
router.use("/waste", wasteRoutes);
router.use("/notifications", notificationRoutes);
router.use("/admin/override", adminOverrideRoutes);

export default router;

