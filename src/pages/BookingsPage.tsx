import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useAppData } from "../contexts/AppDataContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { formatDate, toJsDate } from "../lib/utils";

export function BookingsPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { state, cancelBooking, deleteBooking } = useAppData();
  const { showToast } = useToast();
  const bookings = state.bookings.filter((entry) => entry.userId === user?.uid);

  return (
    <AppShell showAdminLink={profile?.role === "admin" || profile?.role === "superadmin"}>
      <section className="workspace-hero">
        <div>
          <span className="eyebrow-pill">My bookings</span>
          <h1>Track every travel order in one India-first dashboard</h1>
          <p className="text-muted">
            Flight, hotel, package, visa, insurance, forex, and cab requests created anywhere in the app show up here.
          </p>
        </div>
        <div className="hero-summary-card">
          <div className="hero-summary-item">
            <strong>{bookings.length}</strong>
            <span>Total bookings</span>
          </div>
          <div className="hero-summary-item">
            <strong>{bookings.filter((entry) => entry.status === "confirmed").length}</strong>
            <span>Confirmed</span>
          </div>
          <div className="hero-summary-item">
            <strong>{bookings.filter((entry) => entry.status === "cancelled").length}</strong>
            <span>Cancelled</span>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => navigate("/booking-vault")} type="button">
            Open Booking Vault
          </button>
        </div>
      </section>

      <section className="panel-card">
        <div className="subtle-list">
          {bookings.map((booking) => (
            <div className="subtle-item" key={booking.id}>
              <div className="detail-row">
                <div>
                  <strong>{booking.title}</strong>
                  <p className="text-muted">
                    {booking.product} | {booking.from || booking.city || "India"} {booking.to ? `to ${booking.to}` : ""}
                  </p>
                </div>
                <div className="tag-row">
                  <span className="tag">{booking.status}</span>
                  <span className="tag">{booking.currency || "INR"} {booking.amount || 0}</span>
                </div>
              </div>
              <p className="text-muted">
                Travel date: {booking.travelDate || "Flexible"} | Created: {formatDate(toJsDate(booking.createdAt))}
              </p>
              {booking.details ? <p>{booking.details}</p> : null}
              <div className="tag-row">
                {booking.status !== "cancelled" ? (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      void cancelBooking(booking.id);
                      showToast("Booking marked as cancelled.");
                    }}
                    type="button"
                  >
                    Cancel Booking
                  </button>
                ) : null}
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    const confirmed = window.confirm(`Delete "${booking.title}" from your bookings?`);
                    if (!confirmed) return;
                    void deleteBooking(booking.id);
                    showToast("Booking deleted.");
                  }}
                  type="button"
                >
                  Delete Booking
                </button>
              </div>
            </div>
          ))}
          {!bookings.length ? <div className="empty-state">No bookings yet. Use any India travel page to create one.</div> : null}
        </div>
      </section>
    </AppShell>
  );
}
