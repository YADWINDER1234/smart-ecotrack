import { Route, Routes, Navigate } from "react-router-dom";
import { LandingPage } from "../pages/LandingPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { DashboardPage } from "../pages/DashboardPage";
import { QRScanResultPage } from "../pages/QRScanResultPage";
import { useAuth } from "../hooks/useAuth";
import { AdminProductPage } from "../pages/AdminProductPage";
import { AdminQRGenerationPage } from "../pages/AdminQRGenerationPage";
import { AdminComplaintPage } from "../pages/AdminComplaintPage";
import { AdminDashboard } from "../pages/AdminDashboard";
import { AdminAuditPage } from "../pages/AdminAuditPage";
import { RecyclerEventsPage } from "../pages/RecyclerEventsPage";
import { RecyclerComplaintsPage } from "../pages/RecyclerComplaintsPage";
import { ManufacturerProductPage } from "../pages/ManufacturerProductPage";
import { ManufacturerQRGenerationPage } from "../pages/ManufacturerQRGenerationPage";
import { SmartBinDashboard } from "../pages/SmartBinDashboard";
import { RewardsPage } from "../pages/RewardsPage";
import { WasteDetectionPage } from "../pages/WasteDetectionPage";
import { RouteOptimizationPage } from "../pages/RouteOptimizationPage";
import { BlockchainLedgerPage } from "../pages/BlockchainLedgerPage";
import { AIChatbotWidget } from "../components/AIChatbotWidget";

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
  role: "ADMIN" | "RECYCLER" | "MANUFACTURER" | "CONSUMER";
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/dashboard" replace />;
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
        path="/admin/products"
        element={
          <RequireAuth>
            <RequireRole role="ADMIN">
              <AdminProductPage />
            </RequireRole>
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
        path="/recycler/events"
        element={
          <RequireAuth>
            <RequireRole role="RECYCLER">
              <RecyclerEventsPage />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/recycler/complaints"
        element={
          <RequireAuth>
            <RequireRole role="RECYCLER">
              <RecyclerComplaintsPage />
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

      {/* New Feature Routes */}
      <Route
        path="/bins"
        element={
          <RequireAuth>
            <SmartBinDashboard />
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
        path="/waste-detection"
        element={
          <RequireAuth>
            <WasteDetectionPage />
          </RequireAuth>
        }
      />
      <Route
        path="/route-optimization"
        element={
          <RequireAuth>
            <RouteOptimizationPage />
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <AIChatbotWidget />
    </>
  );
}
