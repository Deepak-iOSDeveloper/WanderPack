import { AppShell } from "../components/AppShell";
import { useAppData } from "../contexts/AppDataContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

const wishlistSuggestions = [
  { title: "Jaipur palace stay", category: "hotels", location: "Jaipur", note: "Old city access and rooftop dinner" },
  { title: "Goa villa weekend", category: "homestays", location: "North Goa", note: "Pool villa for groups" },
  { title: "Kashmir spring package", category: "holiday-packages", location: "Srinagar", note: "Valley views and garden season" },
];

export function WishlistPage() {
  const { user, profile } = useAuth();
  const { state, addWishlistItem, removeWishlistItem } = useAppData();
  const { showToast } = useToast();
  const wishlist = state.wishlist.filter((entry) => entry.userId === user?.uid);

  return (
    <AppShell showAdminLink={profile?.role === "admin" || profile?.role === "superadmin"}>
      <section className="two-column-grid dashboard-columns">
        <div className="panel-card">
          <h2 className="section-title">Saved Wishlist</h2>
          <div className="subtle-list">
            {wishlist.map((item) => (
              <div className="subtle-item" key={item.id}>
                <strong>{item.title}</strong>
                <p className="text-muted">{item.category} | {item.location}</p>
                {item.note ? <p>{item.note}</p> : null}
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    void removeWishlistItem(item.id);
                    showToast("Removed from wishlist.");
                  }}
                  type="button"
                >
                  Remove
                </button>
              </div>
            ))}
            {!wishlist.length ? <div className="empty-state">Your wishlist is empty right now.</div> : null}
          </div>
        </div>

        <div className="panel-card">
          <h2 className="section-title">Suggested Saves</h2>
          <div className="subtle-list">
            {wishlistSuggestions.map((item) => (
              <div className="subtle-item" key={item.title}>
                <strong>{item.title}</strong>
                <p className="text-muted">{item.location}</p>
                <p>{item.note}</p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    void addWishlistItem(item);
                    showToast("Added to wishlist.");
                  }}
                  type="button"
                >
                  Save Item
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
