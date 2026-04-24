import { AuthPage } from "./AuthPage";

export function AdminAuthPage() {
  return <AuthPage forcedRole="admin" variant="admin" />;
}
