import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useAppData } from "../contexts/AppDataContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { formatDate } from "../lib/utils";
import type { BookingItem } from "../types";

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AdminPage() {
  const { profile } = useAuth();
  const {
    state,
    updateUserStatus,
    updateBookingStatus,
    deleteTrip,
    removePost,
    deleteBooking,
    sendBroadcast,
    updateSupportTicket,
    resolveSupportTicket,
  } = useAppData();
  const { showToast } = useToast();
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [selectedSupportTicketId, setSelectedSupportTicketId] = useState<string>("");
  const [supportReply, setSupportReply] = useState("");
  const [supportResolutionNote, setSupportResolutionNote] = useState("");
  const [activePanel, setActivePanel] = useState<
    "snapshot" | "users" | "trips" | "posts" | "bookings" | "support" | "activity" | "broadcast"
  >("snapshot");

  const stats = useMemo(
    () => ({
      users: state.users.length,
      pending: state.users.filter((entry) => entry.status === "pending").length,
      banned: state.users.filter((entry) => entry.status === "banned").length,
      trips: state.trips.length,
      posts: state.posts.length,
      bookings: state.bookings.length,
      notifications: state.notifications.length,
    }),
    [state],
  );
  const selectedBooking = state.bookings.find((entry) => entry.id === selectedBookingId) || state.bookings[0];
  const bookingOwner =
    selectedBooking ? state.users.find((entry) => entry.uid === selectedBooking.userId) : null;
  const recentUsers = [...state.users].slice(-5).reverse();
  const recentTrips = state.trips.slice(0, 5);
  const recentPosts = state.posts.slice(0, 5);
  const openTickets = state.supportTickets.filter((entry) => entry.status !== "resolved").slice(0, 5);
  const selectedSupportTicket =
    state.supportTickets.find((entry) => entry.id === selectedSupportTicketId) || state.supportTickets[0] || null;
  const serviceRequests = state.bookings.filter((entry) => ["visa", "insurance", "forex"].includes(entry.product));

  function bookingSummary(entry: BookingItem) {
    return `${entry.destination || entry.city || "India"} | ${entry.travelDate || "Flexible"} | ${entry.currency || "INR"} ${entry.amount || 0}`;
  }

  if (profile?.role !== "admin" && profile?.role !== "superadmin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AppShell mode="admin" showAdminLink>
      <section className="admin-hero">
        <div>
          <h1>Admin Control Room</h1>
          <p>
            Review the traveler data created across the app, moderate activity, and manage bookings from a separate
            operations interface.
          </p>
        </div>
        <div className="tag-row">
          <span className="tag">{stats.users} users</span>
          <span className="tag">{stats.pending} pending</span>
          <span className="tag">{stats.trips} trips</span>
          <span className="tag">{stats.posts} posts</span>
          <span className="tag">{stats.bookings} bookings</span>
          <span className="tag">{state.supportTickets.filter((entry) => entry.status !== "resolved").length} open tickets</span>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card"><strong>{stats.users}</strong><span>Total users</span></div>
        <div className="stat-card"><strong>{stats.pending}</strong><span>Pending approvals</span></div>
        <div className="stat-card"><strong>{stats.banned}</strong><span>Banned users</span></div>
        <div className="stat-card"><strong>{stats.bookings}</strong><span>Bookings saved</span></div>
        <div className="stat-card"><strong>{stats.notifications}</strong><span>Notifications sent</span></div>
      </section>

      <section className="chip-row">
        {[
          ["snapshot", "Snapshot"],
          ["users", "Users"],
          ["trips", "Trips"],
          ["posts", "Posts"],
          ["bookings", "Bookings"],
          ["support", "Support"],
          ["activity", "Activity"],
          ["broadcast", "Broadcast"],
        ].map(([key, label]) => (
          <button
            className={`chip ${activePanel === key ? "active" : ""}`}
            key={key}
            onClick={() => setActivePanel(key as typeof activePanel)}
            type="button"
          >
            {label}
          </button>
        ))}
      </section>

      {activePanel === "snapshot" ? (
        <section className="content-grid">
          <div className="panel-card">
            <h2 className="section-title">Live Platform Snapshot</h2>
            <div className="subtle-list">
              <div className="subtle-item">
                <strong>Traveler accounts</strong>
                <span>{state.users.filter((entry) => entry.role === "traveler").length}</span>
              </div>
              <div className="subtle-item">
                <strong>Organizer accounts</strong>
                <span>{state.users.filter((entry) => entry.role === "admin" || entry.role === "superadmin").length}</span>
              </div>
              <div className="subtle-item">
                <strong>Published posts</strong>
                <span>{state.posts.length}</span>
              </div>
              <div className="subtle-item">
                <strong>Trips in planning</strong>
                <span>{state.trips.filter((entry) => entry.status === "planning").length}</span>
              </div>
              <div className="subtle-item">
                <strong>Open support tickets</strong>
                <span>{state.supportTickets.filter((entry) => entry.status !== "resolved").length}</span>
              </div>
            </div>
          </div>

          <aside className="stack">
            <section className="panel-card">
              <h2 className="section-title">Latest User Activity</h2>
              <div className="subtle-list">
                {state.activityLog.slice(0, 6).map((entry) => (
                  <div className="subtle-item" key={entry.id}>
                    <strong>{entry.title}</strong>
                    <span>{entry.detail}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>
      ) : null}

      {activePanel === "users" ? (
        <section className="content-grid">
          <section className="panel-card">
          <div className="panel-row">
            <h2 className="section-title">Users</h2>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                downloadCsv("wanderpack-users.csv", [
                  ["Name", "Email", "Role", "Status", "Location"],
                  ...state.users.map((entry) => [entry.name, entry.email, entry.role, entry.status, entry.location || ""]),
                ]);
                showToast("Users exported as CSV.");
              }}
              type="button"
            >
              Export CSV
            </button>
          </div>
          <div className="table-like">
            {state.users.map((entry) => (
              <div className="detail-row" key={entry.uid}>
                <div>
                  <strong>{entry.name}</strong>
                  <p className="text-muted">{entry.email} | {entry.role}</p>
                </div>
                <div className="tag-row">
                  <span className="tag">{entry.status}</span>
                  {entry.status === "pending" ? (
                    <button className="btn btn-green btn-sm" onClick={() => void updateUserStatus(entry.uid, "active")} type="button">
                      Approve
                    </button>
                  ) : null}
                  {entry.status !== "banned" ? (
                    <button className="btn btn-outline btn-sm" onClick={() => void updateUserStatus(entry.uid, "banned")} type="button">
                      Ban
                    </button>
                  ) : (
                    <button className="btn btn-sky btn-sm" onClick={() => void updateUserStatus(entry.uid, "active")} type="button">
                      Unban
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="stack">
          <section className="panel-card">
            <h2 className="section-title">Latest Signups</h2>
            <div className="subtle-list">
              {recentUsers.map((entry) => (
                <div className="subtle-item" key={entry.uid}>
                  <strong>{entry.name}</strong>
                  <span>{entry.email} | {entry.role} | {entry.status}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
      ) : null}

      {activePanel === "trips" ? (
        <section className="content-grid">
          <section className="panel-card">
          <h2 className="section-title">Trips</h2>
          <div className="table-like">
            {state.trips.map((entry) => (
              <div className="detail-row" key={entry.id}>
                <div>
                  <strong>{entry.name}</strong>
                  <p className="text-muted">{entry.destination} | {entry.members.length} members | {entry.status}</p>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => void deleteTrip(entry.id)} type="button">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>

        <aside className="stack">
          <section className="panel-card">
            <h2 className="section-title">Recent Trips</h2>
            <div className="subtle-list">
              {recentTrips.map((entry) => (
                <div className="subtle-item" key={entry.id}>
                  <strong>{entry.name}</strong>
                  <span>{entry.destination} | {entry.status}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
      ) : null}

      {activePanel === "posts" ? (
        <section className="content-grid">
          <section className="panel-card">
          <h2 className="section-title">Posts</h2>
          <div className="table-like">
            {state.posts.map((entry) => (
              <div className="detail-row" key={entry.id}>
                <div>
                  <strong>{entry.authorName}</strong>
                  <p className="text-muted">{entry.destination} | {entry.likes || 0} likes</p>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => void removePost(entry.id)} type="button">
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <aside className="stack">
          <section className="panel-card">
            <h2 className="section-title">Recent Posts</h2>
            <div className="subtle-list">
              {recentPosts.map((entry) => (
                <div className="subtle-item" key={entry.id}>
                  <strong>{entry.authorName}</strong>
                  <span>{entry.destination} | {entry.likes || 0} likes</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
      ) : null}

      {activePanel === "bookings" ? (
        <section className="content-grid">
          <div className="panel-card">
            <div className="panel-row">
              <h2 className="section-title">All Bookings</h2>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  downloadCsv("wanderpack-bookings.csv", [
                    ["Traveler", "Email", "Title", "Destination", "Travel Date", "Amount", "Payment", "Status", "Reference"],
                    ...state.bookings.map((entry) => {
                      const owner = state.users.find((user) => user.uid === entry.userId);
                      return [
                        owner?.name || "Unknown",
                        owner?.email || "",
                        entry.title,
                        entry.destination || entry.city || "India",
                        entry.travelDate || "Flexible",
                        `${entry.currency || "INR"} ${entry.amount || 0}`,
                        `${entry.paymentMethod || "upi"} / ${entry.paymentStatus || "pending"}`,
                        entry.status,
                        entry.paymentReference || entry.id,
                      ];
                    }),
                  ]);
                  showToast("Bookings exported as CSV.");
                }}
                type="button"
              >
                Export CSV
              </button>
            </div>
            <div className="table-like">
              {state.bookings.map((entry) => {
                const owner = state.users.find((user) => user.uid === entry.userId);
                return (
                  <button
                    className={`subtle-item admin-booking-row ${selectedBooking?.id === entry.id ? "admin-booking-row-active" : ""}`}
                    key={entry.id}
                    onClick={() => setSelectedBookingId(entry.id)}
                    type="button"
                  >
                    <div>
                      <strong>{entry.title}</strong>
                      <p className="text-muted">{owner?.name || "Unknown traveler"} | {bookingSummary(entry)}</p>
                    </div>
                    <div className="tag-row">
                      <span className="tag">{entry.status}</span>
                      <span className="tag">{entry.paymentStatus || "pending"}</span>
                    </div>
                  </button>
                );
              })}
            </div>
        </div>

        <aside className="stack">
          <section className="panel-card">
            <h2 className="section-title">Service Requests</h2>
            <div className="subtle-list">
              {serviceRequests.length ? (
                serviceRequests.slice(0, 6).map((entry) => {
                  const owner = state.users.find((userItem) => userItem.uid === entry.userId);
                  return (
                    <div className="subtle-item" key={entry.id}>
                      <strong>{entry.title}</strong>
                      <span>{owner?.name || "Unknown traveler"} | {entry.product} | {entry.status}</span>
                      <div className="tag-row">
                        {entry.status !== "completed" ? (
                          <button
                            className="btn btn-green btn-sm"
                            onClick={() => {
                              void updateBookingStatus(entry.id, "completed");
                              showToast("Request marked done.");
                            }}
                            type="button"
                          >
                            Mark Done
                          </button>
                        ) : (
                          <span className="tag">done</span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="subtle-item">
                  <strong>No service requests</strong>
                  <span>Visa, insurance, and forex requests will appear here.</span>
                </div>
              )}
            </div>
          </section>

          <section className="panel-card">
            <h2 className="section-title">Booking Details</h2>
            {selectedBooking ? (
              <>
                <div className="subtle-list">
                  <div className="subtle-item">
                    <strong>Traveler</strong>
                    <span>{bookingOwner?.name || "Unknown"}{bookingOwner?.email ? ` | ${bookingOwner.email}` : ""}</span>
                  </div>
                  <div className="subtle-item">
                    <strong>Booking</strong>
                    <span>{selectedBooking.title}</span>
                  </div>
                  <div className="subtle-item">
                    <strong>Destination</strong>
                    <span>{selectedBooking.destination || selectedBooking.city || "India"}{selectedBooking.state ? `, ${selectedBooking.state}` : ""}</span>
                  </div>
                  <div className="subtle-item">
                    <strong>Travel</strong>
                    <span>{selectedBooking.travelDate || "Flexible"} | {selectedBooking.travelers || 1} travelers</span>
                  </div>
                  <div className="subtle-item">
                    <strong>Amount</strong>
                    <span>{selectedBooking.currency || "INR"} {selectedBooking.amount || 0}</span>
                  </div>
                  <div className="subtle-item">
                    <strong>Payment</strong>
                    <span>{selectedBooking.paymentMethod || "upi"} | {selectedBooking.paymentStatus || "pending"}</span>
                  </div>
                  <div className="subtle-item">
                    <strong>Reference</strong>
                    <span>{selectedBooking.paymentReference || selectedBooking.id}</span>
                  </div>
                  {selectedBooking.couponCode ? (
                    <div className="subtle-item">
                      <strong>Coupon</strong>
                      <span>{selectedBooking.couponCode}{selectedBooking.discountAmount ? ` | Saved ${selectedBooking.currency || "INR"} ${selectedBooking.discountAmount}` : ""}</span>
                    </div>
                  ) : null}
                  {selectedBooking.contactPhone ? (
                    <div className="subtle-item">
                      <strong>Contact</strong>
                      <span>{selectedBooking.contactPhone}</span>
                    </div>
                  ) : null}
                  {selectedBooking.travelerDetails?.length ? (
                    <div className="subtle-item">
                      <strong>Traveler Details</strong>
                      <span>{selectedBooking.travelerDetails.map((entry) => `${entry.name} (${entry.age || "-"}, ${entry.gender})`).join(", ")}</span>
                    </div>
                  ) : null}
                </div>
                  <div className="panel-row" style={{ marginTop: 16 }}>
                  {selectedBooking.status !== "completed" ? (
                    <button
                      className="btn btn-green btn-sm"
                      onClick={() => {
                        void updateBookingStatus(selectedBooking.id, "completed");
                        showToast("Request marked done.");
                      }}
                      type="button"
                    >
                      Mark Done
                    </button>
                  ) : (
                    <span className="tag">done</span>
                  )}
                  <button
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                      const confirmed = window.confirm(`Delete booking "${selectedBooking.title}" from the admin panel?`);
                      if (!confirmed) return;
                      void deleteBooking(selectedBooking.id);
                      setSelectedBookingId("");
                      showToast("Booking deleted.");
                    }}
                    type="button"
                  >
                    Delete Booking
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-card">No bookings saved yet.</div>
            )}
          </section>

          <section className="panel-card">
            <h2 className="section-title">Open Support Queue</h2>
            <div className="subtle-list">
              {openTickets.length ? (
                openTickets.map((entry) => {
                  const owner = state.users.find((user) => user.uid === entry.userId);
                  return (
                    <div className="subtle-item" key={entry.id}>
                      <strong>{entry.subject}</strong>
                      <span>{owner?.name || "Unknown traveler"} | {entry.category} | {entry.status}</span>
                    </div>
                  );
                })
              ) : (
                <div className="subtle-item">
                  <strong>No open tickets</strong>
                  <span>Support queue is clear right now.</span>
                </div>
              )}
            </div>
          </section>
        </aside>
      </section>
      ) : null}

      {activePanel === "support" ? (
        <section className="content-grid">
          <section className="panel-card">
            <h2 className="section-title">Open Support Queue</h2>
            <div className="table-like">
              {state.supportTickets.length ? (
                state.supportTickets.map((entry) => {
                  const owner = state.users.find((user) => user.uid === entry.userId);
                  return (
                    <button
                      className={`subtle-item admin-booking-row ${selectedSupportTicket?.id === entry.id ? "admin-booking-row-active" : ""}`}
                      key={entry.id}
                      onClick={() => {
                        setSelectedSupportTicketId(entry.id);
                        setSupportReply(entry.adminReply || "");
                        setSupportResolutionNote(entry.resolutionNote || "");
                      }}
                      type="button"
                    >
                      <div>
                        <strong>{entry.subject}</strong>
                        <p className="text-muted">
                          {owner?.name || "Unknown traveler"} | {entry.category === "other" ? entry.categoryLabel || "other" : entry.category}
                          {entry.priority ? ` | ${entry.priority}` : ""}
                        </p>
                      </div>
                      <div className="tag-row">
                        <span className="tag">{entry.status}</span>
                        {entry.priority ? <span className="tag">{entry.priority}</span> : null}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="empty-card">Support queue is clear right now.</div>
              )}
            </div>
          </section>

          <aside className="stack">
            <section className="panel-card">
              <h2 className="section-title">Ticket Details</h2>
              {selectedSupportTicket ? (
                <>
                  <div className="subtle-list">
                    <div className="subtle-item">
                      <strong>Subject</strong>
                      <span>{selectedSupportTicket.subject}</span>
                    </div>
                    <div className="subtle-item">
                      <strong>Status</strong>
                      <span>{selectedSupportTicket.status}</span>
                    </div>
                    <div className="subtle-item">
                      <strong>Category</strong>
                      <span>{selectedSupportTicket.category === "other" ? selectedSupportTicket.categoryLabel || "other" : selectedSupportTicket.category}</span>
                    </div>
                    <div className="subtle-item">
                      <strong>Traveler</strong>
                      <span>
                        {(state.users.find((user) => user.uid === selectedSupportTicket.userId)?.name || "Unknown traveler")}
                        {selectedSupportTicket.contactEmail ? ` | ${selectedSupportTicket.contactEmail}` : ""}
                      </span>
                    </div>
                    <div className="subtle-item">
                      <strong>Message</strong>
                      <span>{selectedSupportTicket.message}</span>
                    </div>
                  </div>

                  <div className="stack" style={{ marginTop: 16 }}>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Write an admin reply"
                      value={supportReply}
                      onChange={(event) => setSupportReply(event.target.value)}
                    />
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Resolution note"
                      value={supportResolutionNote}
                      onChange={(event) => setSupportResolutionNote(event.target.value)}
                    />
                    <div className="tag-row">
                      {selectedSupportTicket.status === "open" ? (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            void updateSupportTicket(selectedSupportTicket.id, {
                              status: "in-progress",
                              adminReply: supportReply,
                            });
                            showToast("Ticket moved to in progress.");
                          }}
                          type="button"
                        >
                          Mark In Progress
                        </button>
                      ) : null}
                      <button
                        className="btn btn-green btn-sm"
                        onClick={() => {
                          if (!supportReply.trim()) {
                            showToast("Add an admin reply before resolving.");
                            return;
                          }
                          void resolveSupportTicket(selectedSupportTicket.id, supportReply, supportResolutionNote);
                          showToast("Ticket resolved and traveler notified.");
                        }}
                        type="button"
                      >
                        Resolve Ticket
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-card">Select a support ticket to manage it.</div>
              )}
            </section>
          </aside>
        </section>
      ) : null}

      {activePanel === "activity" ? (
        <section className="content-grid">
          <section className="panel-card">
          <h2 className="section-title">Activity Log</h2>
          <div className="table-like">
            {state.activityLog.map((entry) => (
              <div className="detail-row" key={entry.id}>
                <div>
                  <strong>{entry.title}</strong>
                  <p className="text-muted">{entry.detail}</p>
                </div>
                <span>{formatDate(entry.createdAt as Date)}</span>
              </div>
            ))}
          </div>
        </section>
        </section>
      ) : null}

      {activePanel === "broadcast" ? (
        <section className="content-grid">
          <aside className="stack">
            <section className="panel-card">
            <h2 className="section-title">Broadcast Message</h2>
            <textarea className="form-control" rows={6} value={broadcastMessage} onChange={(event) => setBroadcastMessage(event.target.value)} placeholder="Send a platform-wide announcement" />
            <button
              className="btn btn-primary btn-sm"
              onClick={async () => {
                try {
                  await sendBroadcast(broadcastMessage);
                  setBroadcastMessage("");
                  showToast("Broadcast sent.");
                } catch (error) {
                  console.warn("Broadcast failed:", error);
                  showToast("Broadcast failed. Check Firebase rules and try again.");
                }
              }}
              type="button"
            >
              Send Broadcast
            </button>
          </section>
          </aside>
        </section>
      ) : null}
    </AppShell>
  );
}
