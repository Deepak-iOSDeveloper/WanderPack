import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useAppData } from "../contexts/AppDataContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { db, doc, setDoc, updateProfile } from "../lib/firebase";

export function ProfilePage() {
  const params = useParams();
  const { user, profile, refreshProfile } = useAuth();
  const { state, currentUserState, memberTrips, updateCurrentUserProfileState } = useAppData();
  const { showToast } = useToast();
  const viewedProfile = useMemo(
    () => state.users.find((entry) => entry.uid === (params.uid || user?.uid)) || currentUserState,
    [currentUserState, params.uid, state.users, user?.uid],
  );
  const viewedTrips = useMemo(
    () => state.trips.filter((trip) => trip.members.some((member) => member.uid === viewedProfile?.uid)),
    [state.trips, viewedProfile?.uid],
  );
  const [form, setForm] = useState({
    name: "",
    bio: "",
    location: "",
    notifications: "on" as "on" | "off",
    style: "adventure" as "adventure" | "relaxation" | "culture" | "food",
  });

  useEffect(() => {
    setForm({
      name: viewedProfile?.name || profile?.name || user?.displayName || "",
      bio: viewedProfile?.bio || profile?.bio || "",
      location: viewedProfile?.location || profile?.location || "",
      notifications: viewedProfile?.notifications || profile?.notifications || "on",
      style: viewedProfile?.style || profile?.style || "adventure",
    });
  }, [viewedProfile, profile, user]);

  const isOwnProfile = !params.uid || params.uid === user?.uid;

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
      showToast("Profile saved.");
    } catch (error) {
      console.warn("Profile update failed:", error);
      await updateCurrentUserProfileState(form);
      showToast("Profile saved locally. Firebase profile update failed.");
    }
  }

  return (
    <AppShell showAdminLink={profile?.role === "admin" || profile?.role === "superadmin"}>
      <section className="profile-hero">
        <div className="profile-avatar-large">{(currentUserState?.name || profile?.name || user?.displayName || "T")[0]}</div>
        <div>
          <h1>{viewedProfile?.name || profile?.name || user?.displayName || "Traveler"}</h1>
          <p>{viewedProfile?.email || profile?.email || user?.email}</p>
          <p className="text-muted">{viewedProfile?.bio || "Adventure seeker and trip planner."}</p>
        </div>
      </section>

      <section className="two-column-grid dashboard-columns">
        <div className="panel-card">
          <h2 className="section-title">Edit Profile</h2>
          <div className="stack">
            <input className="form-control" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Display name" />
            <input className="form-control" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder="Location" />
            <textarea className="form-control" value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} placeholder="Bio" rows={5} />
            <select className="form-control" value={form.notifications} onChange={(event) => setForm((current) => ({ ...current, notifications: event.target.value as "on" | "off" }))}>
              <option value="on">Notifications On</option>
              <option value="off">Notifications Off</option>
            </select>
            <select className="form-control" value={form.style} onChange={(event) => setForm((current) => ({ ...current, style: event.target.value as typeof form.style }))}>
              <option value="adventure">Adventure</option>
              <option value="relaxation">Relaxation</option>
              <option value="culture">Culture</option>
              <option value="food">Food</option>
            </select>
            {isOwnProfile ? (
              <button className="btn btn-primary" onClick={handleSave} type="button">
                Save Profile
              </button>
            ) : null}
          </div>
        </div>

        <div className="panel-card">
          <h2 className="section-title">Account Details</h2>
          <div className="detail-list">
            <div><strong>Email</strong><span>{viewedProfile?.email || profile?.email || user?.email}</span></div>
            <div><strong>Role</strong><span>{viewedProfile?.role || "traveler"}</span></div>
            <div><strong>Status</strong><span>{viewedProfile?.status || "active"}</span></div>
            <div><strong>Trips joined</strong><span>{isOwnProfile ? memberTrips.length : viewedTrips.length}</span></div>
            <div><strong>Saved destinations</strong><span>{state.bookmarkedDestinationIds.length}</span></div>
            <div><strong>Following</strong><span>{state.followedUserIds.length}</span></div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
