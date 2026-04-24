import { useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useAppData } from "../contexts/AppDataContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { formatDate, getFirstName, normalizeImageUrl } from "../lib/utils";
import type { TripStatus } from "../types";

const statuses: Array<{ value: "" | TripStatus; label: string }> = [
  { value: "", label: "All Status" },
  { value: "draft", label: "Draft" },
  { value: "planning", label: "Planning" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
];

const destinationPresets = [
  { value: "Goa", label: "Goa", emoji: "Beach" },
  { value: "Manali", label: "Manali", emoji: "Snow" },
  { value: "Kashmir", label: "Kashmir", emoji: "Lake" },
  { value: "Mumbai", label: "Mumbai", emoji: "City" },
  { value: "Delhi", label: "Delhi", emoji: "Monument" },
  { value: "Kerala", label: "Kerala", emoji: "Palm" },
  { value: "custom", label: "Custom destination", emoji: "Pin" },
];

const vibePresets = ["Relaxed", "Adventure", "Food Trail", "Beach", "Culture", "Luxury", "Custom"];
const categoryPresets = ["Leisure", "Honeymoon", "Family", "Friends", "Workation", "Road Trip", "Custom"];
const groupSizePresets = ["2", "4", "6", "8", "10"];
const currencyPresets = ["USD", "INR", "EUR", "GBP"];
const tripStickers = [
  { value: "Palm", label: "Beach vibe" },
  { value: "Peak", label: "Mountain trip" },
  { value: "Camera", label: "Photo memories" },
  { value: "Spark", label: "Special occasion" },
  { value: "Passport", label: "Travel ready" },
  { value: "Heart", label: "Romantic getaway" },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { currentUserState, memberTrips, createTrip, deleteTrip, removePost, state } = useAppData();
  const { showToast } = useToast();
  const createTripRef = useRef<HTMLElement | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | TripStatus>("");
  const [form, setForm] = useState({
    name: "",
    destinationPreset: "Goa",
    destinationCustom: "",
    startDate: "",
    endDate: "",
    vibePreset: "Relaxed",
    vibeCustom: "",
    categoryPreset: "Leisure",
    categoryCustom: "",
    groupSize: "4",
    currency: "USD",
    budgetTotal: "",
    sticker: "Palm",
  });

  const destinationValue =
    form.destinationPreset === "custom" ? form.destinationCustom.trim() : form.destinationPreset;
  const vibeValue = form.vibePreset === "Custom" ? form.vibeCustom.trim() : form.vibePreset;
  const categoryValue = form.categoryPreset === "Custom" ? form.categoryCustom.trim() : form.categoryPreset;

  const filteredTrips = useMemo(
    () =>
      memberTrips.filter((trip) => {
        const query = search.trim().toLowerCase();
        const matchesQuery =
          !query ||
          trip.name.toLowerCase().includes(query) ||
          trip.destination.toLowerCase().includes(query) ||
          (trip.category || "").toLowerCase().includes(query);
        const matchesStatus = !status || trip.status === status;
        return matchesQuery && matchesStatus;
      }),
    [memberTrips, search, status],
  );

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: memberTrips.length,
      upcoming: memberTrips.filter((trip) => trip.startDate && new Date(trip.startDate) > now).length,
      completed: memberTrips.filter((trip) => trip.status === "completed").length,
      invites: memberTrips.reduce(
        (count, trip) => count + trip.members.filter((member) => member.role === "pending").length,
        0,
      ),
    };
  }, [memberTrips]);

  const recentPosts = state.posts.slice(0, 3);

  async function handleCreateTrip() {
    if (!form.name.trim() || !destinationValue) {
      showToast("Trip name and destination are required.");
      return;
    }

    const trip = await createTrip({
      name: form.name.trim(),
      destination: destinationValue,
      startDate: form.startDate,
      endDate: form.endDate,
      vibe: vibeValue || "Relaxed",
      category: categoryValue || "Leisure",
      groupSize: Number(form.groupSize) || 4,
      currency: form.currency,
      budgetTotal: Number(form.budgetTotal) || 0,
      coverImage: form.sticker,
    });

    if (!trip) {
      showToast("We could not create the trip.");
      return;
    }

    setForm({
      name: "",
      destinationPreset: "Goa",
      destinationCustom: "",
      startDate: "",
      endDate: "",
      vibePreset: "Relaxed",
      vibeCustom: "",
      categoryPreset: "Leisure",
      categoryCustom: "",
      groupSize: "4",
      currency: "USD",
      budgetTotal: "",
      sticker: "Palm",
    });
    showToast("Trip created.");
    navigate(`/trip?id=${trip.id}`);
  }

  async function handleDeleteTrip(tripId: string, tripName: string) {
    const confirmed = window.confirm(`Delete "${tripName}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    await deleteTrip(tripId);
    showToast("Trip deleted.");
  }

  async function handleDeletePost(postId: string, destination: string) {
    const confirmed = window.confirm(`Delete the post for "${destination}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    await removePost(postId);
    showToast("Post deleted.");
  }

  if (profile?.role === "admin" || profile?.role === "superadmin") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <AppShell>
      <section className="dashboard-header dashboard-grid">
        <div>
          <span className="eyebrow-pill">Travel workspace</span>
          <h1>
            Hey, <span>{getFirstName(currentUserState?.name || profile?.name || user?.displayName)}</span>
          </h1>
          <p className="text-muted">
            Keep trips, people, budgets, and itinerary changes in one place without the clutter.
          </p>
        </div>
        <div className="panel-card dashboard-summary">
          <h2 className="section-title">Quick Snapshot</h2>
          <div className="simple-grid">
            <div className="metric-box">
              <strong>{state.notifications.filter((entry) => entry.userId === user?.uid && !entry.read).length}</strong>
              <span>Unread notifications</span>
            </div>
            <div className="metric-box">
              <strong>{state.followedUserIds.length}</strong>
              <span>Followed travelers</span>
            </div>
            <div className="metric-box">
              <strong>{state.bookmarkedDestinationIds.length}</strong>
              <span>Saved places</span>
            </div>
            <div className="metric-box">
              <strong>{recentPosts.length}</strong>
              <span>Fresh feed posts</span>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card"><strong>{stats.total}</strong><span>Total Trips</span></div>
        <div className="stat-card"><strong>{stats.upcoming}</strong><span>Upcoming Trips</span></div>
        <div className="stat-card"><strong>{stats.completed}</strong><span>Completed</span></div>
        <div className="stat-card"><strong>{stats.invites}</strong><span>Pending Members</span></div>
      </section>

      <section className="two-column-grid dashboard-columns" ref={createTripRef}>
        <div className="panel-card">
          <h2 className="section-title">Create Trip</h2>
          <div className="trip-builder-preview">
            <div className="trip-sticker-badge">{form.sticker}</div>
            <div>
              <strong>{form.name || "Your new trip"}</strong>
              <p className="text-muted">
                {destinationValue || "Pick a destination"} | {vibeValue || "Choose a vibe"} | {categoryValue || "Choose a category"}
              </p>
            </div>
          </div>

          <div className="trip-form-grid">
            <input className="form-control" placeholder="Trip name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            <select className="form-control" value={form.destinationPreset} onChange={(event) => setForm((current) => ({ ...current, destinationPreset: event.target.value }))}>
              {destinationPresets.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.emoji} {entry.label}
                </option>
              ))}
            </select>
            <input className="form-control" type="date" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} />
            <input className="form-control" type="date" value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} />
            <select className="form-control" value={form.vibePreset} onChange={(event) => setForm((current) => ({ ...current, vibePreset: event.target.value }))}>
              {vibePresets.map((entry) => (
                <option key={entry} value={entry}>{entry}</option>
              ))}
            </select>
            <select className="form-control" value={form.categoryPreset} onChange={(event) => setForm((current) => ({ ...current, categoryPreset: event.target.value }))}>
              {categoryPresets.map((entry) => (
                <option key={entry} value={entry}>{entry}</option>
              ))}
            </select>
            <select className="form-control" value={form.groupSize} onChange={(event) => setForm((current) => ({ ...current, groupSize: event.target.value }))}>
              {groupSizePresets.map((entry) => (
                <option key={entry} value={entry}>{entry} travelers</option>
              ))}
            </select>
            <select className="form-control" value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))}>
              {currencyPresets.map((entry) => (
                <option key={entry} value={entry}>{entry}</option>
              ))}
            </select>
            <input className="form-control" placeholder="Target budget" value={form.budgetTotal} onChange={(event) => setForm((current) => ({ ...current, budgetTotal: event.target.value }))} />
          </div>

          {form.destinationPreset === "custom" ? (
            <div className="panel-subsection">
              <input className="form-control" placeholder="Custom destination" value={form.destinationCustom} onChange={(event) => setForm((current) => ({ ...current, destinationCustom: event.target.value }))} />
            </div>
          ) : null}

          {form.vibePreset === "Custom" || form.categoryPreset === "Custom" ? (
            <div className="trip-form-grid panel-subsection">
              {form.vibePreset === "Custom" ? (
                <input className="form-control" placeholder="Custom vibe" value={form.vibeCustom} onChange={(event) => setForm((current) => ({ ...current, vibeCustom: event.target.value }))} />
              ) : null}
              {form.categoryPreset === "Custom" ? (
                <input className="form-control" placeholder="Custom category" value={form.categoryCustom} onChange={(event) => setForm((current) => ({ ...current, categoryCustom: event.target.value }))} />
              ) : null}
            </div>
          ) : null}

          <div className="panel-subsection">
            <h3 className="section-title">Trip Stickers</h3>
            <div className="sticker-picker">
              {tripStickers.map((sticker) => (
                <button
                  className={`sticker-chip ${form.sticker === sticker.value ? "active" : ""}`}
                  key={sticker.value}
                  onClick={() => setForm((current) => ({ ...current, sticker: sticker.value }))}
                  type="button"
                >
                  <strong>{sticker.value}</strong>
                  <span>{sticker.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => void handleCreateTrip()} type="button">
            Create Trip
          </button>
        </div>

        <div className="panel-card">
          <h2 className="section-title">Recent Activity</h2>
          <div className="subtle-list">
            {state.activityLog.slice(0, 4).map((entry) => (
              <div className="subtle-item" key={entry.id}>
                <div>
                  <strong>{entry.title}</strong>
                  <p className="text-muted">{entry.detail}</p>
                </div>
                <small className="text-muted">{formatDate(entry.createdAt as Date)}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="filter-row">
        <input className="form-control" placeholder="Search trips by name, destination, or category" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select className="form-control" value={status} onChange={(event) => setStatus(event.target.value as "" | TripStatus)}>
          {statuses.map((entry) => (
            <option value={entry.value} key={entry.label}>
              {entry.label}
            </option>
          ))}
        </select>
      </section>

      <section className="panel-row">
        <h2 className="section-title">Saved Trips</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => createTripRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          type="button"
        >
          Create Trip
        </button>
      </section>

      <section className="trip-grid">
        {filteredTrips.map((trip) => (
          <article className="trip-card" key={trip.id}>
            <div className="trip-card-header">
              <span>{trip.coverImage ? `${trip.coverImage} ${trip.vibe || "Trip"}` : trip.vibe || "Trip"}</span>
              <em>{trip.status || "planning"}</em>
            </div>
            <div className="trip-card-body">
              <h3>{trip.name}</h3>
              <p>{trip.destination}</p>
              <small>
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </small>
              <div className="tag-row">
                <span className="tag">{trip.members.length} members</span>
                <span className="tag">{trip.progress || 0}% ready</span>
                <span className="tag">{trip.currency || "USD"} {trip.budgetTotal || 0}</span>
              </div>
              <div className="panel-row">
                <button className="btn btn-outline btn-sm" onClick={() => navigate(`/trip?id=${trip.id}`)} type="button">
                  Open Trip
                </button>
                {trip.adminId === user?.uid || profile?.role === "admin" || profile?.role === "superadmin" ? (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => void handleDeleteTrip(trip.id, trip.name)}
                    type="button"
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
        {!filteredTrips.length ? <div className="empty-card">No trips match your filters right now.</div> : null}
      </section>

      <section className="two-column-grid dashboard-columns">
        <div className="panel-card">
          <h2 className="section-title">From The Feed</h2>
          <div className="subtle-list">
            {recentPosts.map((post) => (
              <div className="subtle-item" key={post.id}>
                <div>
                  {post.image ? (
                    <div
                      className="mini-feed-image"
                      style={{ backgroundImage: `linear-gradient(rgba(18, 31, 44, 0.18), rgba(18, 31, 44, 0.45)), url(${normalizeImageUrl(post.image)})` }}
                    />
                  ) : (
                    <div className="mini-feed-image mini-feed-image-fallback">{post.emoji || "Post"}</div>
                  )}
                  <strong>{post.destination}</strong>
                  <p className="text-muted">{post.caption}</p>
                </div>
                <div className="tag-row">
                  <button className="chip" onClick={() => navigate("/explore")} type="button">
                    Open Feed
                  </button>
                  {post.authorId === user?.uid || profile?.role === "admin" || profile?.role === "superadmin" ? (
                    <button className="chip" onClick={() => void handleDeletePost(post.id, post.destination)} type="button">
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel-card">
          <h2 className="section-title">What To Do Next</h2>
          <div className="tag-row">
            {[
              "Create trip",
              "Invite members",
              "Build itinerary",
              "Track expenses",
              "Approve pending members",
              "Broadcast updates",
            ].map((item) => (
              <span className="tag" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
