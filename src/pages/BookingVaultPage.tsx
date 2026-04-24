import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { useAppData } from "../contexts/AppDataContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { formatDate, normalizeImageUrl, toJsDate } from "../lib/utils";
import type { BookingItem } from "../types";

function BookingImage({ src, alt, label }: { src: string; alt: string; label: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="booking-vault-image image-fallback" aria-label={alt} role="img">
        <strong>{label}</strong>
        <span>Image unavailable</span>
      </div>
    );
  }

  return <img alt={alt} className="booking-vault-image" onError={() => setFailed(true)} src={normalizeImageUrl(src)} />;
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function downloadBookingPdf(booking: BookingItem) {
  const lines = [
    "WanderPack Booking Receipt",
    `Booking: ${booking.title}`,
    `Destination: ${booking.destination || booking.city || "India"}${booking.state ? `, ${booking.state}` : ""}`,
    `Travel Date: ${booking.travelDate || "Flexible"}`,
    `Travelers: ${booking.travelers || 1}`,
    `Payment: ${(booking.paymentMethod || "upi").toUpperCase()} | ${(booking.paymentStatus || "paid").toUpperCase()}`,
    `Reference: ${booking.paymentReference || booking.id}`,
    `Amount: ${booking.currency || "INR"} ${booking.amount || 0}`,
    `Coupon: ${booking.couponCode || "None"}`,
    ...(booking.travelerDetails || []).map((entry, index) => `Traveler ${index + 1}: ${entry.name} | Age ${entry.age || "-"} | ${entry.gender}`),
    ...(booking.itinerary || []).map((entry) => entry),
  ];

  let y = 780;
  const content = lines
    .map((line) => {
      const safeLine = escapePdfText(line);
      const command = `BT /F1 12 Tf 50 ${y} Td (${safeLine}) Tj ET`;
      y -= 20;
      return command;
    })
    .join("\n");

  const stream = `${content}\n`;
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
    `4 0 obj << /Length ${stream.length} >> stream\n${stream}endstream endobj`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${booking.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-receipt.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

function printBookingReceipt(booking: BookingItem) {
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return false;

  const itineraryMarkup = (booking.itinerary || []).map((entry) => `<li>${entry}</li>`).join("");
  const travelersMarkup = (booking.travelerDetails || [])
    .map((entry) => `<li>${entry.name} | Age ${entry.age || "-"} | ${entry.gender}</li>`)
    .join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>${booking.title} Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #123; }
          h1 { margin-bottom: 8px; }
          .muted { color: #5f6c80; margin-bottom: 20px; }
          .box { border: 1px solid #d7deea; border-radius: 16px; padding: 18px; margin-bottom: 18px; }
          .row { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
          .qr { width: 112px; height: 112px; background:
            linear-gradient(90deg, #111 10px, transparent 10px) 0 0 / 28px 28px,
            linear-gradient(#111 10px, transparent 10px) 0 0 / 28px 28px,
            linear-gradient(90deg, transparent 14px, #111 14px, #111 18px, transparent 18px) 0 0 / 28px 28px,
            linear-gradient(transparent 14px, #111 14px, #111 18px, transparent 18px) 0 0 / 28px 28px,
            #fff;
            border: 8px solid #111;
            border-radius: 12px; }
          ul { padding-left: 18px; }
        </style>
      </head>
      <body>
        <h1>WanderPack Booking Receipt</h1>
        <div class="muted">${booking.title}</div>
        <div class="box">
          <div class="row"><strong>Destination</strong><span>${booking.destination || "India"}${booking.state ? `, ${booking.state}` : ""}</span></div>
          <div class="row"><strong>Travel date</strong><span>${booking.travelDate || "Flexible"}</span></div>
          <div class="row"><strong>Payment</strong><span>${booking.paymentMethod || "UPI"} | ${booking.paymentStatus || "paid"}</span></div>
          <div class="row"><strong>Reference</strong><span>${booking.paymentReference || booking.id}</span></div>
          <div class="row"><strong>Total</strong><span>${booking.currency || "INR"} ${booking.amount || 0}</span></div>
          <div class="row"><div class="qr"></div><span>Demo payment QR</span></div>
        </div>
        <div class="box">
          <strong>Traveler Details</strong>
          <ul>${travelersMarkup || "<li>Traveler details not added</li>"}</ul>
        </div>
        <div class="box">
          <strong>Day Wise Itinerary</strong>
          <ul>${itineraryMarkup || "<li>No itinerary saved</li>"}</ul>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  return true;
}

export function BookingVaultPage() {
  const { user, profile } = useAuth();
  const { state, cancelBooking, deleteBooking } = useAppData();
  const { showToast } = useToast();
  const bookings = state.bookings.filter((entry) => entry.userId === user?.uid);
  const groupedBookings = [
    ["holiday-packages", "Holiday Packages"],
    ["flights", "Flights"],
    ["trains", "Trains"],
    ["buses", "Buses"],
    ["cabs", "Cabs"],
    ["hotels", "Hotels"],
    ["homestays", "Homestays"],
    ["visa", "Visa"],
    ["insurance", "Insurance"],
    ["forex", "Forex"],
  ] as const;

  return (
    <AppShell showAdminLink={profile?.role === "admin" || profile?.role === "superadmin"}>
      <section className="workspace-hero">
        <div>
          <span className="eyebrow-pill">Booking vault</span>
          <h1>Store every package, payment, and itinerary detail in one place</h1>
          <p className="text-muted">
            This is your booking storage area with destination images, package filters, dummy payment status, and delete support.
          </p>
        </div>
        <div className="hero-summary-card">
          <div className="hero-summary-item">
            <strong>{bookings.length}</strong>
            <span>Stored bookings</span>
          </div>
          <div className="hero-summary-item">
            <strong>{bookings.filter((entry) => entry.paymentStatus === "paid").length}</strong>
            <span>Paid</span>
          </div>
          <div className="hero-summary-item">
            <strong>{bookings.filter((entry) => entry.status === "cancelled").length}</strong>
            <span>Cancelled</span>
          </div>
        </div>
      </section>

      {groupedBookings.map(([product, label]) => {
        const sectionBookings = bookings.filter((entry) => entry.product === product);
        if (!sectionBookings.length) return null;

        return (
          <section className="stack" key={product}>
            <div className="panel-row">
              <h2 className="section-title">{label}</h2>
              <span className="tag">{sectionBookings.length} saved</span>
            </div>
            <div className="booking-vault-grid">
              {sectionBookings.map((booking) => (
                <article className="booking-vault-card panel-card" key={booking.id}>
            {booking.image ? (
              <div className="booking-vault-image-wrap">
                <BookingImage
                  alt={booking.title}
                  label={booking.destination || booking.city || "India package"}
                  src={booking.image}
                />
              </div>
            ) : null}

            <div className="panel-row">
              <div>
                <h2 className="section-title">{booking.title}</h2>
                <p className="text-muted">
                  {booking.destination || booking.city || "India"}{booking.state ? `, ${booking.state}` : ""} | {booking.product}
                </p>
              </div>
              <div className="tag-row">
                <span className="tag">{booking.status}</span>
                <span className="tag">{booking.paymentStatus || "pending payment"}</span>
              </div>
            </div>

            <div className="tag-row">
              {booking.packageCategory ? <span className="tag">{booking.packageCategory}</span> : null}
              {booking.budgetTier ? <span className="tag">{booking.budgetTier} budget</span> : null}
              {booking.hotelCategory ? <span className="tag">{booking.hotelCategory}</span> : null}
              {booking.discountAmount ? <span className="tag">Saved {booking.currency || "INR"} {booking.discountAmount}</span> : null}
              {typeof booking.withFlight === "boolean" ? <span className="tag">{booking.withFlight ? "With flight" : "Without flight"}</span> : null}
            </div>

            <div className="simple-grid booking-vault-meta">
              <div className="metric-box">
                <strong>{booking.currency || "INR"} {booking.amount || 0}</strong>
                <span>Total package amount</span>
              </div>
              <div className="metric-box">
                <strong>{booking.days || 0}D / {booking.nights || 0}N</strong>
                <span>Trip duration</span>
              </div>
              <div className="metric-box">
                <strong>{booking.travelers || 1}</strong>
                <span>Travelers</span>
              </div>
              <div className="metric-box">
                <strong>{booking.paymentMethod || "upi"}</strong>
                <span>Dummy payment mode</span>
              </div>
            </div>

            <div className="booking-receipt-hero">
              <div className="fake-qr" />
              <div className="receipt-copy">
                <strong>{booking.paymentReference || booking.id}</strong>
                <span>Demo receipt reference</span>
              </div>
            </div>

            {(booking.travelerDetails?.length || booking.contactPhone || booking.couponCode) ? (
              <div className="panel-subsection">
                <h3 className="section-title">Traveler And Offer Details</h3>
                <div className="subtle-list">
                  {booking.travelerDetails?.length ? (
                    <div className="subtle-item">
                      <strong>Travelers</strong>
                      <span>{booking.travelerDetails.map((entry) => `${entry.name} (${entry.age || "-"}, ${entry.gender})`).join(", ")}</span>
                    </div>
                  ) : null}
                  {booking.contactPhone ? (
                    <div className="subtle-item">
                      <strong>Contact</strong>
                      <span>{booking.contactPhone}</span>
                    </div>
                  ) : null}
                  {booking.couponCode ? (
                    <div className="subtle-item">
                      <strong>Coupon</strong>
                      <span>{booking.couponCode}{booking.discountAmount ? ` | Saved ${booking.currency || "INR"} ${booking.discountAmount}` : ""}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            <p className="text-muted">
              Travel date: {booking.travelDate || "Flexible"} | Created: {formatDate(toJsDate(booking.createdAt))}
            </p>
            {booking.details ? <p>{booking.details}</p> : null}

            {booking.itinerary?.length ? (
              <div className="panel-subsection">
                <h3 className="section-title">Day Wise Plan</h3>
                <div className="subtle-list">
                  {booking.itinerary.map((entry) => (
                    <div className="subtle-item" key={`${booking.id}-${entry}`}>
                      <span>{entry}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="panel-row">
              {booking.status !== "cancelled" ? (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    void cancelBooking(booking.id);
                    showToast("Booking marked as cancelled.");
                  }}
                  type="button"
                >
                  Cancel
                </button>
              ) : <span />}
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  const printed = printBookingReceipt(booking);
                  if (!printed) {
                    showToast("Pop-up blocked. Please allow pop-ups to print the receipt.");
                    return;
                  }
                  showToast("Printable receipt opened.");
                }}
                type="button"
              >
                Print Receipt
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  downloadBookingPdf(booking);
                  showToast("PDF receipt downloaded.");
                }}
                type="button"
              >
                Download PDF
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  void deleteBooking(booking.id);
                  showToast("Booking deleted from the vault.");
                }}
                type="button"
              >
                Delete
              </button>
            </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      {!bookings.length ? <div className="empty-card">No booking details saved yet. Book a holiday package to start filling your vault.</div> : null}
    </AppShell>
  );
}
