import { Router } from "express";
import authRoutes from "./authRoutes";
import productRoutes from "./productRoutes";
import qrRoutes from "./qrRoutes";
import recyclingRoutes from "./recyclingRoutes";
import dashboardRoutes from "./dashboardRoutes";
import notificationRoutes from "./notificationRoutes";
import complaintRoutes from "./complaintRoutes";
import adminOverrideRoutes from "./adminOverrideRoutes";
import binRoutes from "./binRoutes";
import rewardRoutes from "./rewardRoutes";
import wasteRoutes from "./wasteRoutes";
import routeRoutes from "./routeRoutes";
import blockchainRoutes from "./blockchainRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/qr", qrRoutes);
router.use("/recycling", recyclingRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/notifications", notificationRoutes);
router.use("/complaints", complaintRoutes);
router.use("/admin", adminOverrideRoutes);
router.use("/bins", binRoutes);
router.use("/rewards", rewardRoutes);
router.use("/waste", wasteRoutes);
router.use("/routes", routeRoutes);
router.use("/blockchain", blockchainRoutes);

export default router;

