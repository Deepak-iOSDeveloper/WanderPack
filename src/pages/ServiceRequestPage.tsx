import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useAppData } from "../contexts/AppDataContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { formatDate, toJsDate } from "../lib/utils";
import type { BookingItem } from "../types";

type ServiceConfig = {
  title: string;
  subtitle: string;
  product: BookingItem["product"];
};

const serviceConfig: Record<string, ServiceConfig> = {
  visa: {
    title: "India outbound visa requests",
    subtitle: "Create guided visa assistance requests for travelers planning international trips from India.",
    product: "visa",
  },
  insurance: {
    title: "Travel insurance plans",
    subtitle: "Save structured insurance requests for domestic and international travel cover.",
    product: "insurance",
  },
  forex: {
    title: "Forex and travel card requests",
    subtitle: "Track forex requests and travel-card needs before departure with structured details.",
    product: "forex",
  },
};

export function ServiceRequestPage() {
  const { service } = useParams();
  const { user, profile } = useAuth();
  const { state, createServiceRequest, deleteBooking } = useAppData();
  const { showToast } = useToast();
  const config = service ? serviceConfig[service] : null;
  const [visaForm, setVisaForm] = useState({
    destination: "United Arab Emirates",
    visaType: "Tourist",
    processing: "Standard",
    departureCity: "Delhi",
    nationality: "Indian",
    passportNumber: "",
    purpose: "Holiday",
    travelDate: "",
    travelers: "1",
    amount: "3500",
    notes: "",
  });
  const [insuranceForm, setInsuranceForm] = useState({
    destination: "Dubai",
    coverage: "International multi-trip",
    duration: "7",
    travelers: "1",
    travelDate: "",
    amount: "1800",
    notes: "",
  });
  const [forexForm, setForexForm] = useState({
    currency: "USD",
    amount: "500",
    pickupCity: "Delhi",
    travelDate: "",
    travelers: "1",
    notes: "",
  });

  if (!config) {
    return <Navigate to="/dashboard" replace />;
  }
  const servicePage = config;

  const requests = useMemo(
    () =>
      state.bookings
        .filter((entry) => entry.userId === user?.uid && entry.product === servicePage.product)
        .sort((a, b) => (toJsDate(b.createdAt)?.getTime() || 0) - (toJsDate(a.createdAt)?.getTime() || 0)),
    [servicePage.product, state.bookings, user?.uid],
  );

  async function handleVisaSubmit() {
    try {
      await createServiceRequest({
        product: "visa",
        title: `${visaForm.destination} ${visaForm.visaType} visa request`,
        destination: visaForm.destination,
        city: visaForm.departureCity,
        travelDate: visaForm.travelDate,
        travelers: Number(visaForm.travelers) || 1,
        amount: Number(visaForm.amount) || 0,
        currency: "INR",
        details:
          `Visa type: ${visaForm.visaType} | Processing: ${visaForm.processing} | Nationality: ${visaForm.nationality} | Purpose: ${visaForm.purpose}` +
          `${visaForm.passportNumber ? ` | Passport: ${visaForm.passportNumber}` : ""}` +
          `${visaForm.notes ? ` | Notes: ${visaForm.notes}` : ""}`,
      });
      showToast("Visa request saved to your bookings.");
      setVisaForm({
        destination: "United Arab Emirates",
        visaType: "Tourist",
        processing: "Standard",
        departureCity: "Delhi",
        nationality: "Indian",
        passportNumber: "",
        purpose: "Holiday",
        travelDate: "",
        travelers: "1",
        amount: "3500",
        notes: "",
      });
    } catch (error) {
      console.warn("Visa request save failed:", error);
      showToast("Request could not be saved.");
    }
  }

  async function handleInsuranceSubmit() {
    try {
      await createServiceRequest({
        product: "insurance",
        title: `${insuranceForm.destination} ${insuranceForm.coverage} insurance request`,
        destination: insuranceForm.destination,
        travelDate: insuranceForm.travelDate,
        travelers: Number(insuranceForm.travelers) || 1,
        amount: Number(insuranceForm.amount) || 0,
        currency: "INR",
        details: `Coverage: ${insuranceForm.coverage} | Duration: ${insuranceForm.duration} days${insuranceForm.notes ? ` | Notes: ${insuranceForm.notes}` : ""}`,
      });
      showToast("Insurance request saved to your bookings.");
      setInsuranceForm({
        destination: "Dubai",
        coverage: "International multi-trip",
        duration: "7",
        travelers: "1",
        travelDate: "",
        amount: "1800",
        notes: "",
      });
    } catch (error) {
      console.warn("Insurance request save failed:", error);
      showToast("Request could not be saved.");
    }
  }

  async function handleForexSubmit() {
    try {
      await createServiceRequest({
        product: "forex",
        title: `${forexForm.currency} forex request`,
        city: forexForm.pickupCity,
        travelDate: forexForm.travelDate,
        travelers: Number(forexForm.travelers) || 1,
        amount: Number(forexForm.amount) || 0,
        currency: forexForm.currency,
        details: `Pickup city: ${forexForm.pickupCity}${forexForm.notes ? ` | Notes: ${forexForm.notes}` : ""}`,
      });
      showToast("Forex request saved to your bookings.");
      setForexForm({
        currency: "USD",
        amount: "500",
        pickupCity: "Delhi",
        travelDate: "",
        travelers: "1",
        notes: "",
      });
    } catch (error) {
      console.warn("Forex request save failed:", error);
      showToast("Request could not be saved.");
    }
  }

  function renderForm() {
    if (servicePage.product === "visa") {
      return (
        <div className="trip-form-grid">
          <select className="form-control" value={visaForm.destination} onChange={(event) => setVisaForm((current) => ({ ...current, destination: event.target.value }))}>
            {["United Arab Emirates", "Thailand", "Singapore", "Malaysia", "United Kingdom", "United States"].map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>
          <select className="form-control" value={visaForm.visaType} onChange={(event) => setVisaForm((current) => ({ ...current, visaType: event.target.value }))}>
            {["Tourist", "Business", "Student", "Transit"].map((entry) => (
              <option key={entry} value={entry}>{entry} Visa</option>
            ))}
          </select>
          <select className="form-control" value={visaForm.processing} onChange={(event) => setVisaForm((current) => ({ ...current, processing: event.target.value }))}>
            {["Standard", "Priority", "Express"].map((entry) => (
              <option key={entry} value={entry}>{entry} Processing</option>
            ))}
          </select>
          <input className="form-control" placeholder="Departure city" value={visaForm.departureCity} onChange={(event) => setVisaForm((current) => ({ ...current, departureCity: event.target.value }))} />
          <input className="form-control" placeholder="Nationality" value={visaForm.nationality} onChange={(event) => setVisaForm((current) => ({ ...current, nationality: event.target.value }))} />
          <input className="form-control" placeholder="Passport number" value={visaForm.passportNumber} onChange={(event) => setVisaForm((current) => ({ ...current, passportNumber: event.target.value.toUpperCase() }))} />
          <select className="form-control" value={visaForm.purpose} onChange={(event) => setVisaForm((current) => ({ ...current, purpose: event.target.value }))}>
            {["Holiday", "Business", "Family Visit", "Study", "Transit"].map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>
          <input className="form-control" type="date" value={visaForm.travelDate} onChange={(event) => setVisaForm((current) => ({ ...current, travelDate: event.target.value }))} />
          <select className="form-control" value={visaForm.travelers} onChange={(event) => setVisaForm((current) => ({ ...current, travelers: event.target.value }))}>
            {["1", "2", "3", "4", "5"].map((entry) => (
              <option key={entry} value={entry}>{entry} traveler{entry === "1" ? "" : "s"}</option>
            ))}
          </select>
          <input className="form-control" placeholder="Expected amount in INR" value={visaForm.amount} onChange={(event) => setVisaForm((current) => ({ ...current, amount: event.target.value }))} />
          <textarea className="form-control trip-form-wide" rows={4} placeholder="Passport, embassy, or travel notes" value={visaForm.notes} onChange={(event) => setVisaForm((current) => ({ ...current, notes: event.target.value }))} />
          <button className="btn btn-primary" onClick={() => void handleVisaSubmit()} type="button">
            Save Visa Request
          </button>
        </div>
      );
    }

    if (servicePage.product === "insurance") {
      return (
        <div className="trip-form-grid">
          <input className="form-control" placeholder="Destination" value={insuranceForm.destination} onChange={(event) => setInsuranceForm((current) => ({ ...current, destination: event.target.value }))} />
          <select className="form-control" value={insuranceForm.coverage} onChange={(event) => setInsuranceForm((current) => ({ ...current, coverage: event.target.value }))}>
            {["International multi-trip", "Single trip", "Family cover", "Senior citizen cover"].map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>
          <input className="form-control" placeholder="Duration in days" value={insuranceForm.duration} onChange={(event) => setInsuranceForm((current) => ({ ...current, duration: event.target.value }))} />
          <input className="form-control" type="date" value={insuranceForm.travelDate} onChange={(event) => setInsuranceForm((current) => ({ ...current, travelDate: event.target.value }))} />
          <select className="form-control" value={insuranceForm.travelers} onChange={(event) => setInsuranceForm((current) => ({ ...current, travelers: event.target.value }))}>
            {["1", "2", "3", "4", "5"].map((entry) => (
              <option key={entry} value={entry}>{entry} traveler{entry === "1" ? "" : "s"}</option>
            ))}
          </select>
          <input className="form-control" placeholder="Expected amount in INR" value={insuranceForm.amount} onChange={(event) => setInsuranceForm((current) => ({ ...current, amount: event.target.value }))} />
          <textarea className="form-control trip-form-wide" rows={4} placeholder="Extra coverage notes" value={insuranceForm.notes} onChange={(event) => setInsuranceForm((current) => ({ ...current, notes: event.target.value }))} />
          <button className="btn btn-primary" onClick={() => void handleInsuranceSubmit()} type="button">
            Save Insurance Request
          </button>
        </div>
      );
    }

    return (
      <div className="trip-form-grid">
        <select className="form-control" value={forexForm.currency} onChange={(event) => setForexForm((current) => ({ ...current, currency: event.target.value }))}>
          {["USD", "EUR", "GBP", "AED", "SGD", "THB"].map((entry) => (
            <option key={entry} value={entry}>{entry}</option>
          ))}
        </select>
        <input className="form-control" placeholder="Amount needed" value={forexForm.amount} onChange={(event) => setForexForm((current) => ({ ...current, amount: event.target.value }))} />
        <input className="form-control" placeholder="Pickup city" value={forexForm.pickupCity} onChange={(event) => setForexForm((current) => ({ ...current, pickupCity: event.target.value }))} />
        <input className="form-control" type="date" value={forexForm.travelDate} onChange={(event) => setForexForm((current) => ({ ...current, travelDate: event.target.value }))} />
        <select className="form-control" value={forexForm.travelers} onChange={(event) => setForexForm((current) => ({ ...current, travelers: event.target.value }))}>
          {["1", "2", "3", "4", "5"].map((entry) => (
            <option key={entry} value={entry}>{entry} traveler{entry === "1" ? "" : "s"}</option>
          ))}
        </select>
        <textarea className="form-control trip-form-wide" rows={4} placeholder="Travel card or pickup notes" value={forexForm.notes} onChange={(event) => setForexForm((current) => ({ ...current, notes: event.target.value }))} />
        <button className="btn btn-primary" onClick={() => void handleForexSubmit()} type="button">
          Save Forex Request
        </button>
      </div>
    );
  }

  return (
    <AppShell showAdminLink={profile?.role === "admin" || profile?.role === "superadmin"}>
      <section className="workspace-hero">
        <div>
          <span className="eyebrow-pill">Travel service</span>
          <h1>{servicePage.title}</h1>
          <p className="text-muted">{servicePage.subtitle}</p>
        </div>
      </section>

      <section className="panel-card">
        <h2 className="section-title">Create Request</h2>
        {renderForm()}
      </section>

      <section className="panel-card">
        <div className="panel-row">
          <h2 className="section-title">Saved Requests</h2>
          <span className="tag">{requests.length} saved</span>
        </div>
        <div className="subtle-list">
          {requests.map((request) => (
            <div className="subtle-item" key={request.id}>
              <div className="detail-row">
                <div>
                  <strong>{request.title}</strong>
                  <p className="text-muted">
                    {request.destination || request.city || request.currency || "Request"} | {request.travelDate || "Flexible"} | Created {formatDate(toJsDate(request.createdAt))}
                  </p>
                </div>
                <div className="tag-row">
                  <span className="tag">{request.status}</span>
                  {request.amount ? <span className="tag">{request.currency || "INR"} {request.amount}</span> : null}
                </div>
              </div>
              {request.details ? <p className="text-muted">{request.details}</p> : null}
              <div className="tag-row">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    const confirmed = window.confirm(`Delete "${request.title}"?`);
                    if (!confirmed) return;
                    void deleteBooking(request.id);
                    showToast("Request deleted.");
                  }}
                  type="button"
                >
                  Delete Request
                </button>
              </div>
            </div>
          ))}
          {!requests.length ? <div className="empty-state">No requests saved yet for this service.</div> : null}
        </div>
      </section>
    </AppShell>
  );
}
