import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useAppData } from "../contexts/AppDataContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { normalizeImageUrl } from "../lib/utils";

const starterTags = ["beach", "city", "food", "culture", "mountains", "budget", "luxury", "weekend"];

export function CreatePostPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { state, createPost } = useAppData();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    destination: "",
    caption: "",
    tags: "",
    emoji: "Boarding",
    image: "",
  });

  async function handlePublish() {
    if (!form.destination.trim() || !form.caption.trim()) {
      showToast("Destination and caption are required.");
      return;
    }

    await createPost({
      destination: form.destination.trim(),
      caption: form.caption.trim(),
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
      emoji: form.emoji.trim() || "Boarding",
      image: form.image.trim(),
    });

    setForm({
      destination: "",
      caption: "",
      tags: "",
      emoji: "Boarding",
      image: "",
    });
    showToast("Post created successfully.");
    navigate("/explore");
  }

  return (
    <AppShell showAdminLink={profile?.role === "admin" || profile?.role === "superadmin"}>
      <section className="workspace-hero">
        <div>
          <span className="eyebrow-pill">Content studio</span>
          <h1>Create destination posts from one control panel</h1>
          <p className="text-muted">
            Publish inspiration updates, highlight trips, and push fresh travel content straight into the explore feed.
          </p>
        </div>
        <div className="hero-summary-card">
          <div className="hero-summary-item">
            <strong>{state.posts.length}</strong>
            <span>Total posts</span>
          </div>
          <div className="hero-summary-item">
            <strong>{state.destinations.length}</strong>
            <span>Destinations</span>
          </div>
          <div className="hero-summary-item">
            <strong>{state.followedUserIds.length}</strong>
            <span>Travel creators followed</span>
          </div>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel-card">
          <div className="panel-row">
            <h2 className="section-title">Post Details</h2>
            <button className="btn btn-outline btn-sm" onClick={() => navigate("/explore")} type="button">
              Open Feed
            </button>
          </div>

          <div className="trip-form-grid">
            <input
              className="form-control"
              placeholder="Destination name"
              value={form.destination}
              onChange={(event) => setForm((current) => ({ ...current, destination: event.target.value }))}
            />
            <input
              className="form-control"
              placeholder="Banner label"
              value={form.emoji}
              onChange={(event) => setForm((current) => ({ ...current, emoji: event.target.value }))}
            />
            <input
              className="form-control trip-form-wide"
              placeholder="Image URL"
              value={form.image}
              onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
            />
            <textarea
              className="form-control trip-form-wide"
              placeholder="Tell travelers what makes this destination worth saving"
              rows={5}
              value={form.caption}
              onChange={(event) => setForm((current) => ({ ...current, caption: event.target.value }))}
            />
            <input
              className="form-control trip-form-wide"
              placeholder="Add comma-separated tags like beach, food, city"
              value={form.tags}
              onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
            />
          </div>

          <div className="panel-subsection">
            <h3 className="section-title">Popular Tags</h3>
            <div className="tag-row">
              {starterTags.map((tag) => (
                <button
                  className="chip"
                  key={tag}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      tags: current.tags ? `${current.tags}, ${tag}` : tag,
                    }))
                  }
                  type="button"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-subsection">
            <button className="btn btn-primary" onClick={() => void handlePublish()} type="button">
              Publish Post
            </button>
          </div>
        </div>

        <aside className="stack">
          <section className="panel-card">
            <h2 className="section-title">Preview</h2>
            <article className="post-card">
              <div
                className={`post-banner post-banner-alt ${form.image.trim() ? "post-banner-with-image" : ""}`}
                style={
                  form.image.trim()
                    ? { backgroundImage: `linear-gradient(rgba(18, 31, 44, 0.2), rgba(18, 31, 44, 0.55)), url(${normalizeImageUrl(form.image.trim())})` }
                    : undefined
                }
              >
                <span>{form.emoji || "Boarding"}</span>
                <em>{form.destination || "Your destination"}</em>
              </div>
              <div className="post-body post-body-stack">
                <p>{form.caption || "Your travel story preview will appear here as you type."}</p>
                <div className="tag-row">
                  {form.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                    .map((tag) => (
                      <span className="tag" key={tag}>
                        #{tag}
                      </span>
                    ))}
                </div>
              </div>
            </article>
          </section>

          <section className="panel-card">
            <h2 className="section-title">Recent Posts</h2>
            <div className="subtle-list">
              {state.posts.slice(0, 4).map((post) => (
                <div className="subtle-item" key={post.id}>
                  <strong>{post.destination}</strong>
                  <p className="text-muted">{post.caption}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </AppShell>
  );
}
