import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { useAppData } from "../contexts/AppDataContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { formatDate, toJsDate } from "../lib/utils";
import type { SupportCategory, SupportPriority } from "../types";

const supportOptions: Array<{ value: SupportCategory; label: string }> = [
  { value: "booking", label: "Booking issue" },
  { value: "payment", label: "Payment problem" },
  { value: "visa", label: "Visa help" },
  { value: "insurance", label: "Insurance help" },
  { value: "forex", label: "Forex help" },
  { value: "account", label: "Account issue" },
  { value: "trip-planner", label: "Trip planner issue" },
  { value: "technical", label: "Technical bug" },
  { value: "other", label: "Other" },
];

export function SupportPage() {
  const { user, profile } = useAuth();
  const { state, createSupportTicket } = useAppData();
  const { showToast } = useToast();
  const tickets = state.supportTickets.filter((entry) => entry.userId === user?.uid);
  const [form, setForm] = useState({
    subject: "",
    category: "booking" as SupportCategory,
    categoryLabel: "",
    priority: "medium" as SupportPriority,
    contactEmail: user?.email || "",
    contactPhone: "",
    message: "",
  });

  async function handleSubmit() {
    if (!form.subject.trim() || !form.message.trim()) {
      showToast("Subject and message are required.");
      return;
    }

    if (form.category === "other" && !form.categoryLabel.trim()) {
      showToast("Please describe the support type.");
      return;
    }

    await createSupportTicket({
      subject: form.subject,
      category: form.category,
      categoryLabel: form.category === "other" ? form.categoryLabel : undefined,
      priority: form.priority,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      message: form.message,
    });

    setForm({
      subject: "",
      category: "booking",
      categoryLabel: "",
      priority: "medium",
      contactEmail: user?.email || "",
      contactPhone: "",
      message: "",
    });
    showToast("Support ticket sent to admin.");
  }

  return (
    <AppShell showAdminLink={profile?.role === "admin" || profile?.role === "superadmin"}>
      <section className="two-column-grid dashboard-columns">
        <div className="panel-card">
          <div className="panel-row">
            <h2 className="section-title">Raise A Support Ticket</h2>
            <span className="tag">{tickets.filter((entry) => entry.status !== "resolved").length} active</span>
          </div>
          <div className="stack">
            <input className="form-control" placeholder="Subject" value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} />
            <select className="form-control" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as SupportCategory }))}>
              {supportOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {form.category === "other" ? (
              <input className="form-control" placeholder="Support type" value={form.categoryLabel} onChange={(event) => setForm((current) => ({ ...current, categoryLabel: event.target.value }))} />
            ) : null}
            <select className="form-control" value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as SupportPriority }))}>
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
              <option value="urgent">Urgent</option>
            </select>
            <input className="form-control" placeholder="Contact email" value={form.contactEmail} onChange={(event) => setForm((current) => ({ ...current, contactEmail: event.target.value }))} />
            <input className="form-control" placeholder="Contact phone (optional)" value={form.contactPhone} onChange={(event) => setForm((current) => ({ ...current, contactPhone: event.target.value }))} />
            <textarea className="form-control" rows={6} placeholder="Tell us what went wrong" value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} />
            <button className="btn btn-primary" onClick={() => void handleSubmit()} type="button">
              Submit Ticket
            </button>
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-row">
            <h2 className="section-title">Recent Tickets</h2>
            <span className="tag">{tickets.length} total</span>
          </div>
          <div className="subtle-list">
            {tickets.map((ticket) => (
              <div className="subtle-item" key={ticket.id}>
                <div className="panel-row">
                  <strong>{ticket.subject}</strong>
                  <div className="tag-row">
                    <span className="tag">{ticket.status}</span>
                    {ticket.priority ? <span className="tag">{ticket.priority}</span> : null}
                  </div>
                </div>
                <p className="text-muted">
                  {ticket.category === "other" ? ticket.categoryLabel || "Other" : ticket.category}
                  {ticket.contactEmail ? ` | ${ticket.contactEmail}` : ""}
                </p>
                <p>{ticket.message}</p>
                {ticket.adminReply ? (
                  <div className="panel-subsection">
                    <strong>Admin reply</strong>
                    <p>{ticket.adminReply}</p>
                  </div>
                ) : null}
                {ticket.resolutionNote ? (
                  <div className="panel-subsection">
                    <strong>Resolution note</strong>
                    <p>{ticket.resolutionNote}</p>
                  </div>
                ) : null}
                <small className="text-muted">
                  Created: {formatDate(toJsDate(ticket.createdAt))}
                  {ticket.resolvedAt ? ` | Resolved: ${formatDate(toJsDate(ticket.resolvedAt))}` : ""}
                </small>
              </div>
            ))}
            {!tickets.length ? <div className="empty-state">No support tickets yet.</div> : null}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
