import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { useAppData } from "../contexts/AppDataContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { fetchBackendHealth, type BackendHealth } from "../lib/api";

export function SettingsPage() {
  const { profile } = useAuth();
  const { currentUserState, setTheme, state, updateCurrentUserProfileState } = useAppData();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    notifications: "on" as "on" | "off",
    style: "adventure" as "adventure" | "relaxation" | "culture" | "food",
    location: "",
    bio: "",
    name: "",
  });
  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null);
  const [backendStatus, setBackendStatus] = useState<"idle" | "checking" | "online" | "offline">("idle");

  useEffect(() => {
    setForm({
      notifications: currentUserState?.notifications || "on",
      style: currentUserState?.style || "adventure",
      location: currentUserState?.location || "",
      bio: currentUserState?.bio || "",
      name: currentUserState?.name || "",
    });
  }, [currentUserState]);

  useEffect(() => {
    let mounted = true;

    async function checkBackend() {
      try {
        setBackendStatus("checking");
        const result = await fetchBackendHealth();
        if (!mounted) return;
        setBackendHealth(result);
        setBackendStatus(result.ok ? "online" : "offline");
      } catch (error) {
        console.warn("Unable to reach backend:", error);
        if (!mounted) return;
        setBackendStatus("offline");
      }
    }

    void checkBackend();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSave() {
    await updateCurrentUserProfileState(form);
    showToast("Settings saved.");
  }

  return (
    <AppShell showAdminLink={profile?.role === "admin" || profile?.role === "superadmin"}>
      <section className="admin-hero">
        <div>
          <span className="eyebrow-pill">Settings</span>
          <h1>Account, notifications, privacy, and appearance</h1>
          <p className="text-muted">Manage your preferences without leaving the trip workspace.</p>
        </div>
      </section>

      <section className="two-column-grid dashboard-columns">
        <div className="panel-card">
          <h2 className="section-title">Profile</h2>
          <div className="stack">
            <input className="form-control" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Display name" />
            <input className="form-control" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder="Location" />
            <textarea className="form-control" rows={5} value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} placeholder="Bio" />
            <select className="form-control" value={form.style} onChange={(event) => setForm((current) => ({ ...current, style: event.target.value as typeof form.style }))}>
              <option value="adventure">Adventure</option>
              <option value="relaxation">Relaxation</option>
              <option value="culture">Culture</option>
              <option value="food">Food</option>
            </select>
          </div>
        </div>

        <div className="panel-card">
          <h2 className="section-title">Notifications And Appearance</h2>
          <div className="stack">
            <select className="form-control" value={form.notifications} onChange={(event) => setForm((current) => ({ ...current, notifications: event.target.value as "on" | "off" }))}>
              <option value="on">Trip invites, updates, reminders: On</option>
              <option value="off">Trip invites, updates, reminders: Off</option>
            </select>
            <select className="form-control" value={state.theme} onChange={(event) => setTheme(event.target.value as "light" | "dark")}>
              <option value="light">Light mode</option>
              <option value="dark">Dark mode</option>
            </select>
            <button className="btn btn-primary" onClick={() => void handleSave()} type="button">
              Save Settings
            </button>
          </div>
        </div>
      </section>

      <section className="panel-card">
        <h2 className="section-title">Backend Status</h2>
        <p className="text-muted">
          MongoDB backend:
          {" "}
          {backendStatus === "checking" ? "Checking..." : backendStatus === "online" ? "Online" : "Offline"}
        </p>
        <p className="text-muted">
          Database:
          {" "}
          {backendHealth?.database || "unavailable"}
        </p>
      </section>
    </AppShell>
  );
}
