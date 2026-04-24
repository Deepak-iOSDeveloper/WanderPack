import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppData } from "../contexts/AppDataContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { indiaTravelProducts } from "../lib/indiaTravelData";
import { getInitials, relativeDate } from "../lib/utils";
import { Toast } from "./Toast";

interface AppShellProps {
  children: ReactNode;
  showAdminLink?: boolean;
  mode?: "traveler" | "admin";
}

export function AppShell({ children, showAdminLink = false, mode = "traveler" }: AppShellProps) {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  const { state, memberTrips, markNotificationsRead, setTheme } = useAppData();
  const { showToast } = useToast();
  const isAdminMode = mode === "admin";

  const unreadNotifications = state.notifications.filter(
    (entry) => entry.userId === profile?.uid && !entry.read,
  );
  const latestNotifications = state.notifications
    .filter((entry) => entry.userId === profile?.uid)
    .slice(0, 4);
  const plannerTripId = memberTrips[0]?.id || state.trips.find((entry) => entry.adminId === profile?.uid)?.id || state.trips[0]?.id;
  const menuItems = isAdminMode
    ? [{ to: "/admin", label: "Control Room", meta: "Live users, trips, posts, bookings, and broadcasts" }]
    : [
        { to: "/dashboard", label: "Dashboard", meta: "Trips and quick stats" },
        { to: "/posts/create", label: "Create Post", meta: "Publish travel updates" },
        { to: "/explore", label: "Explore Feed", meta: "Discover destinations" },
        { to: "/booking-vault", label: "Booking Vault", meta: "Stored package details" },
        { to: "/assistant", label: "FAQ", meta: "Travel help and quick answers" },
        { to: "/notifications", label: "Notifications", meta: `${unreadNotifications.length} unread updates` },
        { to: "/profile", label: "Profile", meta: "Traveler account" },
        { to: "/settings", label: "Settings", meta: "Preferences and theme" },
      ];
  const globalNavItems = isAdminMode
    ? []
    : [
        { to: "/dashboard", label: "Home" },
        { to: "/offers", label: "Offers" },
        { to: "/bookings", label: "My Bookings" },
        { to: "/booking-vault", label: "Booking Vault" },
        { to: "/wishlist", label: "Wishlist" },
        { to: "/services/visa", label: "Visa" },
        { to: "/services/insurance", label: "Insurance" },
        { to: "/services/forex", label: "Forex" },
        { to: "/support", label: "Support" },
      ];

  async function handleLogout() {
    await logout();
    showToast("Signed out successfully.");
    navigate(isAdminMode ? "/admin-auth" : "/auth");
  }

  return (
    <>
      <div className="blob-bg">
        <span className="b1" />
        <span className="b2" />
        <span className="b3" />
        <span className="b4" />
      </div>
      <div className="app-shell-layout">
        <aside className="app-sidebar">
          <NavLink className="nav-logo" to={isAdminMode ? "/admin" : "/dashboard"}>
            WanderPack
          </NavLink>
          <p className="sidebar-caption">
            {isAdminMode
              ? "Operations workspace for reviewing traveler activity, bookings, and platform health."
              : "Travel workspace inspired by modern booking dashboards."}
          </p>

          {!isAdminMode ? (
            <div className="travel-product-rail">
              {indiaTravelProducts.map((product) => (
                <NavLink className="travel-product-pill" key={product.key} to={`/india/${product.key}`}>
                  <span>{product.icon}</span>
                  {product.label}
                </NavLink>
              ))}
            </div>
          ) : null}

          <div className="sidebar-group">
            {menuItems.map((item) => (
              <NavLink className="sidebar-link" key={item.to} to={item.to}>
                <strong>{item.label}</strong>
                <span>{item.meta}</span>
              </NavLink>
            ))}
            {!isAdminMode ? (
              <button
                className="sidebar-link sidebar-link-button"
                onClick={() => navigate(plannerTripId ? `/trip?id=${plannerTripId}` : "/dashboard")}
                type="button"
              >
                <strong>Trip Planner</strong>
                <span>Build itinerary and budget</span>
              </button>
            ) : null}
            {showAdminLink && !isAdminMode ? (
              <NavLink className="sidebar-link" to="/admin">
                <strong>Admin Panel</strong>
                <span>Moderation and broadcasts</span>
              </NavLink>
            ) : null}
          </div>

          <div className="sidebar-card sidebar-profile-card">
            <div className="post-author">
              <button className="nav-avatar" onClick={() => navigate(isAdminMode ? "/admin/profile" : "/profile")} type="button">
                {getInitials(profile?.name)}
              </button>
              <div>
                <strong>{profile?.name || "Traveler"}</strong>
                <p className="text-muted">{isAdminMode ? "admin workspace" : profile?.role || "traveler"}</p>
              </div>
            </div>
            {isAdminMode ? (
              <div className="tag-row">
                <span className="tag">Live control room</span>
                <span className="tag">{state.users.length} users tracked</span>
              </div>
            ) : (
              <div className="tag-row">
                <button
                  className="chip notification-chip"
                  onClick={() => {
                    void markNotificationsRead();
                    showToast("Notifications marked as read.");
                  }}
                  type="button"
                >
                  Notifications {unreadNotifications.length ? `(${unreadNotifications.length})` : ""}
                </button>
                <button
                  className="chip"
                  onClick={() => setTheme(state.theme === "light" ? "dark" : "light")}
                  type="button"
                >
                  {state.theme === "light" ? "Dark Mode" : "Light Mode"}
                </button>
              </div>
            )}
            <button className="btn btn-outline btn-sm" onClick={handleLogout} type="button">
              Log Out
            </button>
          </div>
        </aside>

        <main className="app-main">
          {!isAdminMode ? (
            <nav className="global-top-nav">
              <div className="global-top-links">
                {globalNavItems.map((item) => (
                  <NavLink className="global-top-link" key={item.to} to={item.to}>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </nav>
          ) : null}
          <header className="workspace-topbar">
            <div>
              <span className="eyebrow">{isAdminMode ? "Admin workspace" : "Travel dashboard"}</span>
              <h2>
                {isAdminMode
                  ? "Review traveler activity, bookings, platform content, and broadcasts from one place"
                  : "Manage trips, posts, members, and planning tools in one place"}
              </h2>
            </div>
            <div className="workspace-topbar-actions">
              {isAdminMode ? (
                <>
                  <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()} type="button">
                    Refresh Live View
                  </button>
                  <button
                    className="btn btn-sky btn-sm"
                    onClick={() => setTheme(state.theme === "light" ? "dark" : "light")}
                    type="button"
                  >
                    {state.theme === "light" ? "Dark Mode" : "Light Mode"}
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate("/posts/create")} type="button">
                    Create Post
                  </button>
                  <button className="btn btn-sky btn-sm" onClick={() => navigate("/dashboard")} type="button">
                    New Trip
                  </button>
                </>
              )}
            </div>
          </header>

          {!!latestNotifications.length && !isAdminMode ? (
            <section className="section section-tight">
              <div className="notification-strip">
                {latestNotifications.map((entry) => (
                  <article className={`mini-note ${entry.read ? "" : "mini-note-unread"}`} key={entry.id}>
                    <strong>{entry.title}</strong>
                    <span>{entry.body}</span>
                    <small>{relativeDate(entry.createdAt)}</small>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
          <div className="section">{children}</div>
        </main>
      </div>
      <Toast />
    </>
  );
}
