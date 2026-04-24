import { Link } from "react-router-dom";
import { Toast } from "../components/Toast";

export function LandingPage() {
  return (
    <>
      <div className="blob-bg">
        <span className="b1" />
        <span className="b2" />
        <span className="b3" />
        <span className="b4" />
      </div>

      <nav className="wp-nav">
        <Link className="nav-logo" to="/">
          WanderPack
        </Link>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#explore">Explore</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div className="nav-right">
          <Link className="btn btn-outline btn-sm" to="/auth">
            Traveler Login
          </Link>
          <Link className="btn btn-outline btn-sm" to="/admin-auth">
            Admin Login
          </Link>
          <Link className="btn btn-primary btn-sm" to="/auth">
            Sign Up
          </Link>
        </div>
      </nav>

      <section className="hero section">
        <div className="hero-copy">
          <span className="eyebrow-pill">Plan together, travel better</span>
          <h1>
            Plan Epic Trips with <span>Your Whole Squad</span>
          </h1>
          <p>
            WanderPack helps groups build itineraries, track budgets, invite travelers, and share every trip update in one place.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary btn-lg" to="/auth">
              Get Started Free
            </Link>
            <a className="btn btn-outline btn-lg" href="#how-it-works">
              Watch Demo
            </a>
          </div>
        </div>

        <div className="hero-panel">
          <div className="glass-card">
            <strong>🏖️ Bali Escape</strong>
            <p>5 travelers, 3 villas saved, and a sunset cruise locked in.</p>
            <div className="mini-progress">
              <span>Trip progress</span>
              <strong>72%</strong>
            </div>
            <div className="progress">
              <div className="progress-fill" style={{ width: "72%" }} />
            </div>
          </div>
          <div className="glass-card offset">
            <strong>🍜 Tokyo Sprint</strong>
            <p>Food itinerary, weather check, Gmail trip plan, and packing ready.</p>
          </div>
        </div>
      </section>

      <section className="stats-grid section">
        {[
          ["24K+", "Trips"],
          ["180K+", "Travelers"],
          ["95+", "Destinations"],
          ["4.9★", "Rating"],
        ].map(([value, label]) => (
          <div className="stat-card" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section className="feature-grid section" id="features">
        {[
          ["🗺️", "Trip dashboard", "See all your trips, invites, and updates in one overview."],
          ["📅", "Itinerary builder", "Plan days, activities, notes, and group schedules together."],
          ["👥", "Member management", "Invite travelers, approve access, and control trip roles."],
          ["💰", "Budget tracker", "Track planned vs actual spending and split costs by traveler."],
          ["📸", "Travel feed", "Discover destinations and share your own trip highlights."],
          ["🤖", "Trip assistant", "Get weather, packing lists, and smart suggestions quickly."],
        ].map(([icon, title, text]) => (
          <article className="feature-card" key={title}>
            <div style={{ fontSize: "2.2rem" }}>{icon}</div>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="two-column-grid section" id="how-it-works">
        <div className="panel-card">
          <h2 className="section-title">How It Works</h2>
          <div className="subtle-list">
            <div className="subtle-item">
              <strong>1. Start a trip</strong>
              <p className="text-muted">Create a trip, set the destination and dates, and choose the travel vibe.</p>
            </div>
            <div className="subtle-item">
              <strong>2. Build with your group</strong>
              <p className="text-muted">Invite your squad, assign activities, manage the budget, and collaborate live.</p>
            </div>
            <div className="subtle-item">
              <strong>3. Share the final plan</strong>
              <p className="text-muted">Use weather, assistant tools, and Gmail-ready plan sharing before you leave.</p>
            </div>
          </div>
        </div>

        <div className="panel-card" id="explore">
          <h2 className="section-title">Popular Destinations</h2>
          <div className="stories-row">
            {["Bali", "Tokyo", "Swiss Alps", "Paris", "Goa"].map((place) => (
              <article className="story-card" key={place}>
                <strong>{place}</strong>
                <span className="text-muted">Popular with groups</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="two-column-grid section">
        <div className="panel-card">
          <h2 className="section-title">Testimonials</h2>
          <div className="subtle-list">
            <div className="subtle-item">
              <strong>Ava Mitchell</strong>
              <p className="text-muted">“This is the first time our whole squad actually stayed aligned from planning to departure.”</p>
            </div>
            <div className="subtle-item">
              <strong>Marco Rivera</strong>
              <p className="text-muted">“The dashboard and itinerary tabs made the trip feel organized instead of chaotic.”</p>
            </div>
          </div>
        </div>

        <div className="panel-card" id="pricing">
          <h2 className="section-title">Ready To Start?</h2>
          <p className="text-muted">Use the platform free to create trips, invite travelers, and manage your next group adventure.</p>
          <div className="tag-row">
            <span className="tag">Realtime planning</span>
            <span className="tag">Protected routes</span>
            <span className="tag">Firebase-backed</span>
          </div>
          <Link className="btn btn-primary" to="/auth">
            Get Started Free
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="trip-hero-card hero-split">
          <div>
            <h2 className="section-title">Bring your whole trip crew into one place</h2>
            <p className="text-muted">Plan days, send invites, track spending, and share the final plan without scattered chats.</p>
          </div>
          <Link className="btn btn-primary btn-lg" to="/auth">
            Create Your First Trip
          </Link>
        </div>
      </section>

      <footer className="section">
        <div className="panel-card detail-row">
          <div>
            <strong>WanderPack</strong>
            <p className="text-muted">© 2026 WanderPack. Plan together, travel better.</p>
          </div>
          <div className="tag-row">
            <span className="tag">Instagram</span>
            <span className="tag">Twitter</span>
            <span className="tag">YouTube</span>
          </div>
        </div>
      </footer>
      <Toast />
    </>
  );
}
