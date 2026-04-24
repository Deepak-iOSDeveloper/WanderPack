import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactElement;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="page-loader">Loading WanderPack...</div>;
  }

  if (!user) {
    return <Navigate to={adminOnly ? "/admin-auth" : "/auth"} replace />;
  }

  if (adminOnly && profile?.role !== "admin" && profile?.role !== "superadmin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
