import { Route, Routes, Navigate } from "react-router-dom";
import { LandingPage } from "../pages/LandingPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { DashboardPage } from "../pages/DashboardPage";
import { QRScanResultPage } from "../pages/QRScanResultPage";
import { useAuth } from "../hooks/useAuth";
import { AdminQRGenerationPage } from "../pages/AdminQRGenerationPage";
import { AdminDashboard } from "../pages/AdminDashboard";
import { ManufacturerProductPage } from "../pages/ManufacturerProductPage";
import { ManufacturerQRGenerationPage } from "../pages/ManufacturerQRGenerationPage";
import { WasteDetectionPage } from "../pages/WasteDetectionPage";
import { RewardsPage } from "../pages/RewardsPage";
import { AdminProductPage } from "../pages/AdminProductPage";
import { AdminComplaintPage } from "../pages/AdminComplaintPage";
import { AdminAuditPage } from "../pages/AdminAuditPage";
import { SmartBinDashboard } from "../pages/SmartBinDashboard";
import { RouteOptimizationPage } from "../pages/RouteOptimizationPage";
import { BlockchainLedgerPage } from "../pages/BlockchainLedgerPage";
import { RecyclerEventsPage } from "../pages/RecyclerEventsPage";
import { RecyclerComplaintsPage } from "../pages/RecyclerComplaintsPage";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="container">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireRole({
  role,
  children
}: {
  role: string | string[];
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export function AppRouter() {
  return (
    <>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/scan" element={<QRScanResultPage />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <RequireRole role="ADMIN">
              <AdminDashboard />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/products/:id/qr"
        element={
          <RequireAuth>
            <RequireRole role="ADMIN">
              <AdminQRGenerationPage />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/manufacturer/products"
        element={
          <RequireAuth>
            <RequireRole role="MANUFACTURER">
              <ManufacturerProductPage />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/manufacturer/products/:id/qr"
        element={
          <RequireAuth>
            <RequireRole role="MANUFACTURER">
              <ManufacturerQRGenerationPage />
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route
        path="/waste-detection"
        element={
          <RequireAuth>
            <WasteDetectionPage />
          </RequireAuth>
        }
      />
      <Route
        path="/rewards"
        element={
          <RequireAuth>
            <RewardsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/products"
        element={
          <RequireAuth>
            <RequireRole role={["ADMIN", "MANUFACTURER"]}>
              <AdminProductPage />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <RequireAuth>
            <RequireRole role="ADMIN">
              <AdminComplaintPage />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/audit"
        element={
          <RequireAuth>
            <RequireRole role="ADMIN">
              <AdminAuditPage />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/bins"
        element={
          <RequireAuth>
            <RequireRole role={["ADMIN", "RECYCLER"]}>
              <SmartBinDashboard />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/route-optimization"
        element={
          <RequireAuth>
            <RequireRole role={["ADMIN", "RECYCLER"]}>
              <RouteOptimizationPage />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/blockchain"
        element={
          <RequireAuth>
            <BlockchainLedgerPage />
          </RequireAuth>
        }
      />
      <Route
        path="/recycler/events"
        element={
          <RequireAuth>
            <RequireRole role={["RECYCLER", "ADMIN"]}>
              <RecyclerEventsPage />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/recycler/complaints"
        element={
          <RequireAuth>
            <RequireRole role={["RECYCLER", "ADMIN"]}>
              <RecyclerComplaintsPage />
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
