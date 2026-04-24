import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useAppData } from "../contexts/AppDataContext";
import { useAuth } from "../contexts/AuthContext";
import { updateNotificationDocument } from "../lib/api";
import { relativeDate } from "../lib/utils";

const filters = ["all", "trip", "feed", "member", "budget", "admin", "system"] as const;

const typeIcons: Record<string, string> = {
  trip: "Trip",
  member: "Member",
  budget: "Budget",
  feed: "Feed",
  admin: "Admin",
  system: "Alert",
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { state, markNotificationsRead } = useAppData();
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("all");

  const notifications = useMemo(
    () =>
      state.notifications.filter((entry) => {
        const belongsToUser = entry.userId === profile?.uid;
        const matchesFilter = activeFilter === "all" || entry.type === activeFilter;
        return belongsToUser && matchesFilter;
      }),
    [activeFilter, profile?.uid, state.notifications],
  );

  async function handleOpenNotification(notificationId: string, type: string) {
    await updateNotificationDocument(notificationId, { read: true });

    if (type === "feed") {
      navigate("/explore");
      return;
    }

    if (type === "member" || type === "trip" || type === "budget") {
      navigate("/dashboard");
      return;
    }

    navigate("/dashboard");
  }

  return (
    <AppShell showAdminLink={profile?.role === "admin" || profile?.role === "superadmin"}>
      <section className="admin-hero">
        <div>
          <span className="eyebrow-pill">Notifications</span>
          <h1>Stay on top of trip and social updates</h1>
          <p className="text-muted">Trip invites, itinerary changes, likes, comments, followers, and reminders all appear here.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => void markNotificationsRead()} type="button">
          Mark All As Read
        </button>
      </section>

      <section className="chip-row">
        {filters.map((filter) => (
          <button className={`chip ${activeFilter === filter ? "active" : ""}`} key={filter} onClick={() => setActiveFilter(filter)} type="button">
            {filter}
          </button>
        ))}
      </section>

      <section className="panel-card">
        <div className="subtle-list">
          {notifications.map((entry) => (
            <button
              className={`subtle-item subtle-action ${entry.read ? "" : "mini-note-unread"}`}
              key={entry.id}
              onClick={() => void handleOpenNotification(entry.id, entry.type)}
              type="button"
            >
              <strong>{typeIcons[entry.type] || "Info"} | {entry.title}</strong>
              <p className="text-muted">{entry.body}</p>
              <small className="text-muted">{relativeDate(entry.createdAt)}</small>
            </button>
          ))}
          {!notifications.length ? <div className="empty-state">No notifications in this category right now.</div> : null}
        </div>
      </section>
    </AppShell>
  );
}
