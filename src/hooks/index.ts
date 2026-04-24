// Re-export app hooks from their source contexts.
export { useAuth } from "../contexts/AuthContext";
export { useToast } from "../contexts/ToastContext";
export { useAppData } from "../contexts/AppDataContext";

import { useAuth } from "../contexts/AuthContext";

/**
 * Hook to check if user has required role
 */
export function useHasRole(role: string | string[]) {
  const { profile } = useAuth();
  const roles = Array.isArray(role) ? role : [role];
  return profile ? roles.includes(profile.role) : false;
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin() {
  const { profile } = useAuth();
  return profile ? ["admin", "superadmin"].includes(profile.role) : false;
}
