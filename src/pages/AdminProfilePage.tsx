import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { useAppData } from "../contexts/AppDataContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { db, doc, setDoc, updateProfile } from "../lib/firebase";

export function AdminProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const { state, updateCurrentUserProfileState } = useAppData();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: "",
    bio: "",
    location: "",
    notifications: "on" as "on" | "off",
    style: "adventure" as "adventure" | "relaxation" | "culture" | "food",
  });

  useEffect(() => {
    setForm({
      name: profile?.name || user?.displayName || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      notifications: profile?.notifications || "on",
      style: profile?.style || "adventure",
    });
  }, [profile, user]);

  async function handleSave() {
    if (!user) return;

    try {
      await updateProfile(user, { displayName: form.name });
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: form.name,
          bio: form.bio,
          location: form.location,
          notifications: form.notifications,
          style: form.style,
        },
        { merge: true },
      );
      await updateCurrentUserProfileState(form);
      await refreshProfile();
      showToast("Admin profile saved.");
    } catch (error) {
      console.warn("Admin profile update failed:", error);
      await updateCurrentUserProfileState(form);
      showToast("Admin profile saved locally. Firebase profile update failed.");
    }
  }

  return (
    <AppShell mode="admin">
      <section className="admin-hero">
        <div>
          <h1>Admin Profile</h1>
          <p>Manage your organizer identity, contact details, and admin workspace preferences.</p>
        </div>
        <div className="tag-row">
          <span className="tag">{profile?.role || "admin"}</span>
          <span className="tag">{profile?.status || "active"}</span>
          <span className="tag">{state.users.length} users visible</span>
        </div>
      </section>

      <section className="two-column-grid dashboard-columns">
        <div className="panel-card">
          <h2 className="section-title">Edit Admin Profile</h2>
          <div className="stack">
            <input
              className="form-control"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Admin display name"
            />
            <input
              className="form-control"
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              placeholder="Location"
            />
            <textarea
              className="form-control"
              value={form.bio}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
              placeholder="Admin bio"
              rows={5}
            />
            <select
              className="form-control"
              value={form.notifications}
              onChange={(event) => setForm((current) => ({ ...current, notifications: event.target.value as "on" | "off" }))}
            >
              <option value="on">Notifications On</option>
              <option value="off">Notifications Off</option>
            </select>
            <select
              className="form-control"
              value={form.style}
              onChange={(event) => setForm((current) => ({ ...current, style: event.target.value as typeof form.style }))}
            >
              <option value="adventure">Adventure</option>
              <option value="relaxation">Relaxation</option>
              <option value="culture">Culture</option>
              <option value="food">Food</option>
            </select>
            <button className="btn btn-primary" onClick={() => void handleSave()} type="button">
              Save Admin Profile
            </button>
          </div>
        </div>

        <div className="panel-card">
          <h2 className="section-title">Admin Account Details</h2>
          <div className="detail-list">
            <div><strong>Email</strong><span>{profile?.email || user?.email}</span></div>
            <div><strong>Role</strong><span>{profile?.role || "admin"}</span></div>
            <div><strong>Status</strong><span>{profile?.status || "active"}</span></div>
            <div><strong>Live users visible</strong><span>{state.users.length}</span></div>
            <div><strong>Trips monitored</strong><span>{state.trips.length}</span></div>
            <div><strong>Bookings monitored</strong><span>{state.bookings.length}</span></div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
