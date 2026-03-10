import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type Props = {
  children: React.ReactNode;
  roles?: Array<"ADMIN" | "RECYCLER" | "MANUFACTURER" | "CONSUMER">;
};

export function ProtectedRoute({ children, roles }: Props) {
  const { user, displayUser, isLoading } = useAuth();
  if (isLoading) return <div className="container">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(displayUser?.role || user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default ProtectedRoute;
