import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useAppData } from "../contexts/AppDataContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { normalizeImageUrl } from "../lib/utils";
import type { BookingItem } from "../types";

const featuredOffers: Array<{
  title: string;
  product: BookingItem["product"];
  route: string;
  price: number;
  note: string;
  image: string;
  badge: string;
}> = [
  {
    title: "Goa summer flight sale",
    product: "flights",
    route: "Delhi to Goa",
    price: 4899,
    note: "Morning non-stop seats",
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c3/BeachFun.jpg",
    badge: "Beach deal",
  },
  {
    title: "Udaipur lake hotel special",
    product: "hotels",
    route: "Udaipur",
    price: 3299,
    note: "Breakfast included",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/87/City_Palace%2C_Udaipur.jpg",
    badge: "Lake stay",
  },
  {
    title: "Kerala family package",
    product: "holiday-packages",
    route: "Kochi to Munnar and Alleppey",
    price: 18999,
    note: "Hotel plus sightseeing",
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c4/India_-_Kerala_-_005_-_the_busy_backwaters_of_Alleppey_%282068832658%29.jpg",
    badge: "Family favorite",
  },
  {
    title: "Mumbai to Pune cab saver",
    product: "cabs",
    route: "Airport pickup",
    price: 3499,
    note: "One-way outstation",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/21/Gateway_of_India%2Cmumbai%2CTN553.JPG",
    badge: "Quick ride",
  },
];

function OfferImage({ src, alt, badge }: { src: string; alt: string; badge: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="offers-image image-fallback" aria-label={alt} role="img">
        <strong>{badge}</strong>
        <span>Offer preview</span>
      </div>
    );
  }

  return <img alt={alt} className="offers-image" onError={() => setFailed(true)} src={normalizeImageUrl(src)} />;
}

export function OffersPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { addWishlistItem, createBooking } = useAppData();
  const { showToast } = useToast();

  return (
    <AppShell showAdminLink={profile?.role === "admin" || profile?.role === "superadmin"}>
      <section className="workspace-hero">
        <div>
          <span className="eyebrow-pill">Top offers</span>
          <h1>Travel deals inspired by MakeMyTrip-style offer shelves</h1>
          <p className="text-muted">Save deals to wishlist or convert them into a real booking entry instantly.</p>
        </div>
      </section>

      <section className="trip-grid">
        {featuredOffers.map((offer) => (
          <article className="trip-card india-offer-card offers-card" key={offer.title}>
            <div className="offers-media">
              <OfferImage alt={offer.title} badge={offer.badge} src={offer.image} />
              <div className="offers-overlay">
                <span className="tag">{offer.badge}</span>
                <em>From Rs {offer.price}</em>
              </div>
            </div>
            <div className="trip-card-header">
              <span>{offer.product}</span>
              <em>{offer.route}</em>
            </div>
            <div className="trip-card-body">
              <h3>{offer.title}</h3>
              <p>{offer.note}</p>
              <div className="tag-row">
                <span className="tag">{offer.route}</span>
                <span className="tag">Instant booking</span>
              </div>
              <div className="panel-row">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    void createBooking({
                      product: offer.product,
                      title: offer.title,
                      city: offer.route,
                      amount: offer.price,
                      currency: "INR",
                      details: offer.note,
                      image: offer.image,
                      paymentMethod: "upi",
                      paymentStatus: "paid",
                      paymentReference: `WP-${Date.now().toString().slice(-8)}`,
                    });
                    showToast("Offer saved as booking.");
                  }}
                  type="button"
                >
                  Book Now
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    void addWishlistItem({
                      title: offer.title,
                      category: offer.product,
                      location: offer.route,
                      note: offer.note,
                      image: offer.image,
                    });
                    showToast("Offer saved to wishlist.");
                  }}
                  type="button"
                >
                  Save
                </button>
                <button className="chip" onClick={() => navigate(`/india/${offer.product}`)} type="button">
                  Open Page
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
