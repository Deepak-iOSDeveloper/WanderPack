import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useAppData } from "../contexts/AppDataContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import {
  buildGmailTripPlanLink,
  describeWeatherCode,
  fetchDestinationWeather,
  generatePackingList,
  generateTripSuggestions,
} from "../lib/travelTools";
import { formatDate, relativeDate } from "../lib/utils";
import type { ActivityType, ExpenseCategory, TripStatus } from "../types";

const tripTabs = ["overview", "itinerary", "members", "budget", "notes"] as const;
const activityTypes: ActivityType[] = ["flight", "hotel", "food", "tour", "transport", "experience"];
const expenseCategories: ExpenseCategory[] = ["flights", "hotels", "food", "activities", "transport", "misc"];
const tripStatuses: TripStatus[] = ["draft", "planning", "confirmed", "completed"];

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function TripPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const {
    state,
    memberTrips,
    updateTrip,
    duplicateTrip,
    addDay,
    addActivity,
    moveActivity,
    removeActivity,
    voteActivity,
    addExpense,
    removeExpense,
    inviteMember,
    updateMemberRole,
    removeMember,
    addTripComment,
  } = useAppData();
  const [params] = useSearchParams();
  const routeParams = useParams();
  const [activeTab, setActiveTab] = useState<(typeof tripTabs)[number]>("overview");
  const [activeDayId, setActiveDayId] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isAddingDay, setIsAddingDay] = useState(false);
  const [newDayLabel, setNewDayLabel] = useState("");
  const [activityForm, setActivityForm] = useState({
    name: "",
    type: "experience" as ActivityType,
    time: "",
    location: "",
    notes: "",
  });
  const [expenseForm, setExpenseForm] = useState({
    label: "",
    amount: "",
    actual: "",
    category: "food" as ExpenseCategory,
  });
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherInfo, setWeatherInfo] = useState<{
    destinationLabel: string;
    temperature: number;
    windspeed: number;
    weatherCode: number;
  } | null>(null);

  const tripId = params.get("id") || routeParams.id || null;
  const trip =
    state.trips.find((entry) => entry.id === tripId) ||
    memberTrips[0] ||
    state.trips.find((entry) => entry.adminId === user?.uid) ||
    state.trips[0] ||
    null;

  useEffect(() => {
    if (!trip) return;
    setNotesDraft(trip.notes || "");
  }, [trip?.id]);

  useEffect(() => {
    if (!trip) return;
    if (!activeDayId && trip.itinerary?.[0]?.id) {
      setActiveDayId(trip.itinerary[0].id);
    }
  }, [activeDayId, trip?.itinerary]);

  const isAdmin = useMemo(() => !!trip && trip.adminId === user?.uid, [trip, user]);
  const currentDay = trip?.itinerary?.find((day) => day.id === activeDayId) || trip?.itinerary?.[0];
  const totalPlanned = (trip?.budget || []).reduce((sum, item) => sum + item.amount, 0);
  const totalActual = (trip?.budget || []).reduce((sum, item) => sum + (item.actual || 0), 0);
  const usdRate = 83;
  const totalActualInr = trip?.currency === "INR" ? totalActual : totalActual * usdRate;
  const totalActualUsd = trip?.currency === "USD" ? totalActual : totalActual / usdRate;
  const perPerson =
    trip?.members.filter((member) => member.role !== "pending").length
      ? totalActual / trip.members.filter((member) => member.role !== "pending").length
      : 0;
  const suggestedPackingList = trip ? generatePackingList(trip, describeWeatherCode(weatherInfo?.weatherCode)) : [];
  const aiSuggestions = generateTripSuggestions(trip?.destination || "", [trip?.category || "", trip?.vibe || ""]);

  if (!trip) {
    return (
      <AppShell showAdminLink={profile?.role === "admin" || profile?.role === "superadmin"}>
        <div className="page-loader">Trip not found.</div>
      </AppShell>
    );
  }

  const activeTrip = trip;

  async function handleDuplicateTrip() {
    const nextTrip = await duplicateTrip(activeTrip.id);
    if (!nextTrip) return;
    showToast("Trip duplicated.");
    navigate(`/trip?id=${nextTrip.id}`);
  }

  async function handleLoadWeather() {
    setWeatherLoading(true);
    const result = await fetchDestinationWeather(activeTrip.destination);
    setWeatherInfo(result);
    setWeatherLoading(false);
    if (!result) showToast("Weather could not be loaded.");
  }

  async function handleGeneratePackingList() {
    await updateTrip(activeTrip.id, { packingList: suggestedPackingList });
    showToast("Packing list updated.");
  }

  async function handleAddDay() {
    if (!newDayLabel.trim()) {
      showToast("Day label is required.");
      return;
    }
    const newDayId = await addDay(activeTrip.id, newDayLabel.trim());
    if (newDayId) {
      setActiveDayId(newDayId);
    }
    setNewDayLabel("");
    setIsAddingDay(false);
    showToast("Day added.");
  }

  async function handleAddActivity() {
    if (!currentDay) {
      showToast("Add a day first.");
      return;
    }
    if (!activityForm.name.trim()) {
      showToast("Activity name is required.");
      return;
    }

    await addActivity(activeTrip.id, currentDay.id, {
      name: activityForm.name,
      type: activityForm.type,
      time: activityForm.time,
      location: activityForm.location,
      notes: activityForm.notes,
      icon: activityForm.type,
    });

    setActivityForm({ name: "", type: "experience", time: "", location: "", notes: "" });
    showToast("Activity added.");
  }

  async function handleAddExpense() {
    if (!expenseForm.label.trim() || !expenseForm.amount) {
      showToast("Expense name and amount are required.");
      return;
    }

    await addExpense(activeTrip.id, {
      label: expenseForm.label,
      amount: Number(expenseForm.amount),
      actual: Number(expenseForm.actual || expenseForm.amount),
      category: expenseForm.category,
      currency: activeTrip.currency || "USD",
      paidBy: user?.uid || activeTrip.adminId,
      splitBetween: activeTrip.members.filter((member) => member.role !== "pending").map((member) => member.uid),
      emoji: expenseForm.category,
    });

    setExpenseForm({ label: "", amount: "", actual: "", category: "food" });
    showToast("Expense added.");
  }

  async function handleSaveNotes() {
    await updateTrip(activeTrip.id, { notes: notesDraft });
    showToast("Trip notes saved.");
  }

  async function handleDeleteNotes() {
    setNotesDraft("");
    await updateTrip(activeTrip.id, { notes: "" });
    showToast("Trip notes deleted.");
  }

  async function handleInviteMember() {
    if (!inviteEmail.trim()) {
      showToast("Enter an email address.");
      return;
    }
    await inviteMember(activeTrip.id, inviteEmail.trim());
    setInviteEmail("");
    showToast("Invite created.");
  }

  function handleGmailInvite() {
    if (!inviteEmail.trim()) {
      showToast("Enter an email address first.");
      return;
    }

    const subject = encodeURIComponent(`Join my WanderPack trip: ${activeTrip.name}`);
    const body = encodeURIComponent(
      [
        `Hi,`,
        ``,
        `You are invited to join my trip "${activeTrip.name}" on WanderPack.`,
        `Destination: ${activeTrip.destination}`,
        `Dates: ${formatDate(activeTrip.startDate)} - ${formatDate(activeTrip.endDate)}`,
        `Trip link: ${window.location.origin}/trip?id=${activeTrip.id}`,
      ].join("\n"),
    );

    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(inviteEmail.trim())}&su=${subject}&body=${body}`, "_blank", "noopener,noreferrer");
    showToast("Gmail invite compose opened.");
  }

  async function handleAddComment() {
    if (!commentDraft.trim()) {
      showToast("Comment cannot be empty.");
      return;
    }
    await addTripComment(activeTrip.id, commentDraft.trim());
    setCommentDraft("");
    showToast("Comment posted.");
  }

  return (
    <AppShell showAdminLink={profile?.role === "admin" || profile?.role === "superadmin"}>
      <section className="trip-hero-card hero-split">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <span className="eyebrow-pill">Trip Planner</span>
            {memberTrips.length > 0 && (
              <select
                className="form-control"
                style={{ width: "auto", display: "inline-block", height: "36px", padding: "0 12px", minWidth: "200px" }}
                value={trip.id}
                onChange={(e) => navigate(`/trip?id=${e.target.value}`)}
              >
                {memberTrips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <h1>{trip.name}</h1>
          <p>
            {trip.destination} | {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
          </p>
          <div className="tag-row">
            <span className="tag">{trip.status || "planning"}</span>
            <span className="tag">{trip.category || "Leisure"}</span>
            <span className="tag">{trip.members.length} members</span>
            <span className="tag">{trip.progress || 0}% complete</span>
          </div>
        </div>
        <div className="stack action-stack">
          <button className="btn btn-primary btn-sm" onClick={() => void handleDuplicateTrip()} type="button">
            Duplicate Trip
          </button>
          <button
            className="btn btn-sky btn-sm"
            onClick={() => {
              window.navigator.clipboard.writeText(`${window.location.origin}/trip?id=${trip.id}`);
              showToast("Share link copied.");
            }}
            type="button"
          >
            Share Link
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => window.print()} type="button">
            Print / PDF
          </button>
        </div>
      </section>

      <section className="chip-row">
        {tripTabs.map((tab) => (
          <button className={`chip ${activeTab === tab ? "active" : ""}`} key={tab} onClick={() => setActiveTab(tab)} type="button">
            {tab}
          </button>
        ))}
      </section>

      {activeTab === "overview" ? (
        <>
          <section className="two-column-grid dashboard-columns">
            <div className="panel-card">
              <h2 className="section-title">Trip Details</h2>
              <div className="trip-form-grid">
                <input className="form-control" value={trip.name} onChange={(event) => void updateTrip(trip.id, { name: event.target.value })} />
                <input className="form-control" value={trip.destination} onChange={(event) => void updateTrip(trip.id, { destination: event.target.value })} />
                <select className="form-control" value={trip.status || "planning"} onChange={(event) => void updateTrip(trip.id, { status: event.target.value as TripStatus })}>
                  {tripStatuses.map((entry) => (
                    <option value={entry} key={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
                <input className="form-control" value={trip.vibe || ""} onChange={(event) => void updateTrip(trip.id, { vibe: event.target.value })} placeholder="Vibe" />
                <input className="form-control" value={trip.currency || "USD"} onChange={(event) => void updateTrip(trip.id, { currency: event.target.value.toUpperCase() })} placeholder="Currency" />
                <input className="form-control" value={String(trip.budgetTotal || 0)} onChange={(event) => void updateTrip(trip.id, { budgetTotal: Number(event.target.value) || 0 })} placeholder="Budget target" />
                <input className="form-control" value={trip.startDate || ""} onChange={(event) => void updateTrip(trip.id, { startDate: event.target.value })} placeholder="Start date" />
                <input className="form-control" value={trip.endDate || ""} onChange={(event) => void updateTrip(trip.id, { endDate: event.target.value })} placeholder="End date" />
                <input className="form-control" value={String(trip.groupSize || 0)} onChange={(event) => void updateTrip(trip.id, { groupSize: Number(event.target.value) || 0 })} placeholder="Group size" />
              </div>
              <div style={{ marginTop: '16px' }}>
                <button className="btn btn-primary" onClick={() => showToast("Trip details saved successfully!")} type="button">
                  Save Details
                </button>
              </div>
            </div>

            <div className="panel-card">
              <h2 className="section-title">Summary</h2>
              <div className="detail-list">
                <div><strong>Share code</strong><span>{trip.shareCode || "Private"}</span></div>
                <div><strong>Packing list</strong><span>{(trip.packingList || []).join(", ") || "Not set"}</span></div>
                <div><strong>Comments</strong><span>{trip.comments?.length || 0}</span></div>
                <div><strong>Pending approvals</strong><span>{trip.members.filter((member) => member.role === "pending").length}</span></div>
              </div>
            </div>
          </section>

          <section className="split-panel">
            <div className="panel-card">
              <div className="panel-row">
                <h2 className="section-title">Weather For Destination</h2>
                <button className="btn btn-outline btn-sm" onClick={() => void handleLoadWeather()} type="button">
                  {weatherLoading ? "Loading..." : "Load Weather"}
                </button>
              </div>
              {weatherInfo ? (
                <div className="simple-grid">
                  <div className="metric-box">
                    <strong>{Math.round(weatherInfo.temperature)} C</strong>
                    <span>{weatherInfo.destinationLabel}</span>
                  </div>
                  <div className="metric-box">
                    <strong>{Math.round(weatherInfo.windspeed)} km/h</strong>
                    <span>{describeWeatherCode(weatherInfo.weatherCode)}</span>
                  </div>
                </div>
              ) : (
                <div className="empty-state">Load weather to get destination conditions before you finalize the plan.</div>
              )}
            </div>

            <div className="panel-card">
              <h2 className="section-title">Smart Trip Tools</h2>
              <div className="tag-row">
                {suggestedPackingList.map((item) => (
                  <span className="tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>
              <div className="tag-row">
                <button className="btn btn-primary btn-sm" onClick={() => void handleGeneratePackingList()} type="button">
                  Generate Packing List
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    window.open(buildGmailTripPlanLink(trip), "_blank", "noopener,noreferrer");
                    showToast("Gmail compose opened.");
                  }}
                  type="button"
                >
                  Send Plan On Gmail
                </button>
              </div>
              <div className="subtle-list">
                {aiSuggestions.map((suggestion) => (
                  <div className="subtle-item" key={suggestion.title}>
                    <strong>{suggestion.title}</strong>
                    <p className="text-muted">{suggestion.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === "itinerary" ? (
        <div className="trip-layout">
          <aside className="panel-card">
            <div className="panel-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
              <h2 className="section-title">Trip Days</h2>
              {isAdmin ? (
                isAddingDay ? (
                  <div className="inline-form" style={{ width: '100%' }}>
                    <input className="form-control" style={{ height: '36px', padding: '0 8px' }} value={newDayLabel} onChange={(e) => setNewDayLabel(e.target.value)} placeholder="Day label" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') void handleAddDay(); else if (e.key === 'Escape') setIsAddingDay(false); }} />
                    <button className="btn btn-primary btn-sm" onClick={() => void handleAddDay()} type="button">Save</button>
                    <button className="btn btn-outline btn-sm" onClick={() => setIsAddingDay(false)} type="button">Cancel</button>
                  </div>
                ) : (
                  <button className="btn btn-sky btn-sm" onClick={() => setIsAddingDay(true)} type="button">
                    Add Day
                  </button>
                )
              ) : null}
            </div>
            <div className="stack">
              {(trip.itinerary || []).map((day, index) => (
                <button
                  className={`chip ${currentDay?.id === day.id ? "active" : ""}`}
                  key={day.id}
                  onClick={() => setActiveDayId(day.id)}
                  type="button"
                >
                  Day {index + 1}: {day.label}
                </button>
              ))}
            </div>
          </aside>

          <section className="panel-card">
            <div className="panel-row">
              <h2 className="section-title">{currentDay ? `${currentDay.label} itinerary` : "Select a day"}</h2>
              <span className="text-muted">{currentDay?.date ? formatDate(currentDay.date) : "Date flexible"}</span>
            </div>

            <div className="stack">
              {(currentDay?.activities || []).map((activity, index) => {
                const hasVoted = !!activity.votes?.some((vote) => vote.userId === user?.uid);
                return (
                  <div className="activity-card" key={activity.id}>
                    <div className="detail-row">
                      <div>
                        <strong>{activity.name}</strong>
                        <p className="text-muted">
                          {activity.type} | {activity.time || "TBD"} | {activity.location || "Location pending"}
                        </p>
                      </div>
                      <div className="tag-row">
                        <button className={`chip ${hasVoted ? "active" : ""}`} onClick={() => void voteActivity(trip.id, currentDay?.id || "", activity.id)} type="button">
                          Vote ({activity.votes?.length || 0})
                        </button>
                        {isAdmin ? (
                          <>
                            <button className="chip" disabled={index === 0} onClick={() => void moveActivity(trip.id, currentDay?.id || "", activity.id, "up")} type="button">
                              Up
                            </button>
                            <button className="chip" disabled={index === (currentDay?.activities.length || 1) - 1} onClick={() => void moveActivity(trip.id, currentDay?.id || "", activity.id, "down")} type="button">
                              Down
                            </button>
                            <button className="chip" onClick={() => void removeActivity(trip.id, currentDay?.id || "", activity.id)} type="button">
                              Remove
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <p>{activity.notes || "No notes yet."}</p>
                  </div>
                );
              })}
            </div>

            {isAdmin ? (
              <div className="panel-subsection">
                <h3 className="section-title">Add Activity</h3>
                <div className="trip-form-grid">
                  <input className="form-control" placeholder="Activity name" value={activityForm.name} onChange={(event) => setActivityForm((current) => ({ ...current, name: event.target.value }))} />
                  <select className="form-control" value={activityForm.type} onChange={(event) => setActivityForm((current) => ({ ...current, type: event.target.value as ActivityType }))}>
                    {activityTypes.map((type) => (
                      <option value={type} key={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <input className="form-control" placeholder="Time" value={activityForm.time} onChange={(event) => setActivityForm((current) => ({ ...current, time: event.target.value }))} />
                  <input className="form-control" placeholder="Location" value={activityForm.location} onChange={(event) => setActivityForm((current) => ({ ...current, location: event.target.value }))} />
                  <input className="form-control trip-form-wide" placeholder="Notes" value={activityForm.notes} onChange={(event) => setActivityForm((current) => ({ ...current, notes: event.target.value }))} />
                  <button className="btn btn-primary" onClick={() => void handleAddActivity()} type="button">
                    Add Activity
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      {activeTab === "members" ? (
        <section className="two-column-grid dashboard-columns">
          <div className="panel-card">
            <div className="panel-row">
              <h2 className="section-title">Group Members</h2>
              {isAdmin ? (
                <div className="inline-form">
                  <input className="form-control" placeholder="Invite by email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} />
                  <button className="btn btn-primary btn-sm" onClick={() => void handleInviteMember()} type="button">
                    Invite
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={handleGmailInvite} type="button">
                    Gmail Invite
                  </button>
                </div>
              ) : null}
            </div>
            <div className="stack">
              {trip.members.map((member) => (
                <div className="detail-row" key={member.uid}>
                  <div>
                    <strong>{member.name}</strong>
                    <p className="text-muted">{member.email}</p>
                  </div>
                  <div className="tag-row">
                    <span className="tag">{member.role}</span>
                    {isAdmin && member.uid !== trip.adminId ? (
                      <>
                        {member.role === "pending" ? (
                          <button className="btn btn-green btn-sm" onClick={() => void updateMemberRole(trip.id, member.uid, "member")} type="button">
                            Approve
                          </button>
                        ) : null}
                        <button className="btn btn-outline btn-sm" onClick={() => void removeMember(trip.id, member.uid)} type="button">
                          Remove
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-card">
            <h2 className="section-title">Trip Comments</h2>
            <div className="stack">
              {(trip.comments || []).map((comment) => (
                <div className="activity-card" key={comment.id}>
                  <div className="detail-row">
                    <strong>{comment.authorName}</strong>
                    <span>{relativeDate(comment.createdAt)}</span>
                  </div>
                  <p>{comment.text}</p>
                </div>
              ))}
            </div>
            <div className="inline-form">
              <input className="form-control" placeholder="Add a group comment" value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} />
              <button className="btn btn-primary btn-sm" onClick={() => void handleAddComment()} type="button">
                Post
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === "budget" ? (
        <section className="two-column-grid dashboard-columns">
          <div className="panel-card">
            <h2 className="section-title">Budget Tracker</h2>
          <div className="detail-list">
              <div><strong>Planned</strong><span>{formatMoney(totalPlanned, trip.currency || "USD")}</span></div>
              <div><strong>Actual</strong><span>{formatMoney(totalActual, trip.currency || "USD")}</span></div>
              <div><strong>Per person</strong><span>{formatMoney(perPerson, trip.currency || "USD")}</span></div>
              <div><strong>Budget vs target</strong><span>{formatMoney((trip.budgetTotal || 0) - totalActual, trip.currency || "USD")}</span></div>
              <div><strong>INR view</strong><span>{formatMoney(totalActualInr, "INR")}</span></div>
              <div><strong>USD view</strong><span>{formatMoney(totalActualUsd, "USD")}</span></div>
            </div>
            <div className="stack">
              {(trip.budget || []).map((item) => (
                <div className="detail-row" key={item.id}>
                  <div>
                    <strong>{item.label}</strong>
                    <p className="text-muted">{item.category} | split across {item.splitBetween.length} people</p>
                  </div>
                  <div className="tag-row">
                    <span className="tag">{formatMoney(item.actual || item.amount, item.currency)}</span>
                    {isAdmin ? (
                      <button className="chip" onClick={() => void removeExpense(trip.id, item.id)} type="button">
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-card">
            <h2 className="section-title">Add Expense</h2>
            <div className="trip-form-grid">
              <input className="form-control" placeholder="Expense label" value={expenseForm.label} onChange={(event) => setExpenseForm((current) => ({ ...current, label: event.target.value }))} />
              <select className="form-control" value={expenseForm.category} onChange={(event) => setExpenseForm((current) => ({ ...current, category: event.target.value as ExpenseCategory }))}>
                {expenseCategories.map((category) => (
                  <option value={category} key={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input className="form-control" placeholder="Planned amount" value={expenseForm.amount} onChange={(event) => setExpenseForm((current) => ({ ...current, amount: event.target.value }))} />
              <input className="form-control" placeholder="Actual amount" value={expenseForm.actual} onChange={(event) => setExpenseForm((current) => ({ ...current, actual: event.target.value }))} />
              <button className="btn btn-primary" onClick={() => void handleAddExpense()} type="button">
                Add Expense
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === "notes" ? (
        <section className="panel-card">
          <h2 className="section-title">Notes And Packing</h2>
          <textarea className="form-control" rows={8} value={notesDraft} onChange={(event) => setNotesDraft(event.target.value)} />
          <div className="tag-row">
            {(trip.packingList || []).map((item) => (
              <span className="tag" key={item}>
                {item}
              </span>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => void handleSaveNotes()} type="button">
            Save Notes
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => void handleDeleteNotes()} type="button">
            Delete Notes
          </button>
        </section>
      ) : null}
    </AppShell>
  );
}
