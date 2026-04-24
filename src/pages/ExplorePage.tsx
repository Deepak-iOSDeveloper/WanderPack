import { useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { useAppData } from "../contexts/AppDataContext";
import { useAuth } from "../contexts/AuthContext";
import { normalizeImageUrl } from "../lib/utils";
import { useToast } from "../contexts/ToastContext";
import { getInitials, relativeDate } from "../lib/utils";

const filters = ["all", "beach", "mountains", "culture", "food", "city", "budget"];

export function ExplorePage() {
  const { user, profile } = useAuth();
  const {
    state,
    currentUserState,
    createPost,
    toggleLikePost,
    toggleBookmarkPost,
    addPostComment,
    toggleFollow,
    toggleDestinationBookmark,
    removePost,
  } = useAppData();
  const { showToast } = useToast();
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("");
  const [form, setForm] = useState({ destination: "", caption: "", tags: "", emoji: "Post", image: "" });
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const filteredPosts = useMemo(
    () =>
      state.posts.filter((post) => {
        const matchesFilter =
          activeFilter === "all"
            ? true
            : post.category === activeFilter || post.tags?.includes(activeFilter);
        const query = search.toLowerCase();
        const matchesSearch =
          !query ||
          post.destination.toLowerCase().includes(query) ||
          post.caption.toLowerCase().includes(query) ||
          (post.tags || []).some((tag) => tag.toLowerCase().includes(query));
        return matchesFilter && matchesSearch;
      }),
    [activeFilter, search, state.posts],
  );

  const filteredDestinations = useMemo(
    () =>
      state.destinations.filter((destination) => {
        const query = search.toLowerCase();
        const matchesSearch =
          !query ||
          destination.name.toLowerCase().includes(query) ||
          destination.region.toLowerCase().includes(query) ||
          destination.bestFor.some((item) => item.toLowerCase().includes(query));
        const matchesBudget = !budgetFilter || destination.budget === budgetFilter;
        return matchesSearch && matchesBudget;
      }),
    [budgetFilter, search, state.destinations],
  );

  async function handleCreatePost() {
    if (!form.destination || !form.caption) {
      showToast("Destination and caption are required.");
      return;
    }
    await createPost({
      destination: form.destination,
      caption: form.caption,
      tags: form.tags.split(",").map((entry) => entry.trim()).filter(Boolean),
      emoji: form.emoji,
      image: form.image.trim(),
    });
    setForm({ destination: "", caption: "", tags: "", emoji: "Post", image: "" });
    showToast("Post shared.");
  }

  async function handleDeletePost(postId: string, destination: string) {
    const confirmed = window.confirm(`Delete the post for "${destination}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }
    await removePost(postId);
    showToast("Post deleted.");
  }

  async function handleAddComment(postId: string) {
    const text = commentDrafts[postId]?.trim();
    if (!text) {
      showToast("Write a comment first.");
      return;
    }
    await addPostComment(postId, text);
    setCommentDrafts((current) => ({ ...current, [postId]: "" }));
    showToast("Comment added.");
  }

  const suggestedTravelers = state.users.filter((entry) => entry.uid !== currentUserState?.uid).slice(0, 4);

  return (
    <AppShell showAdminLink={profile?.role === "admin" || profile?.role === "superadmin"}>
      <div className="explore-header">
        <div>
          <span className="eyebrow-pill">Explore</span>
          <h1>Find places and travel ideas</h1>
          <p className="text-muted">Search destinations, browse recent posts, and save ideas worth turning into a trip.</p>
        </div>
      </div>

      <section className="panel-card">
        <h2 className="section-title">Share A Quick Update</h2>
        <div className="trip-form-grid">
          <input className="form-control" placeholder="Destination" value={form.destination} onChange={(event) => setForm((current) => ({ ...current, destination: event.target.value }))} />
          <input className="form-control" placeholder="Caption" value={form.caption} onChange={(event) => setForm((current) => ({ ...current, caption: event.target.value }))} />
          <input className="form-control" placeholder="Tags separated by commas" value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} />
          <input className="form-control" placeholder="Post style" value={form.emoji} onChange={(event) => setForm((current) => ({ ...current, emoji: event.target.value }))} />
          <input className="form-control" placeholder="Image URL" value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} />
          <button className="btn btn-primary" onClick={() => void handleCreatePost()} type="button">
            Share Post
          </button>
        </div>
      </section>

      <section className="filter-row" style={{ margin: "24px 0" }}>
        <input className="form-control" placeholder="Search destinations, tags, or captions" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select className="form-control" value={budgetFilter} onChange={(event) => setBudgetFilter(event.target.value)}>
          <option value="">All budgets</option>
          <option value="low">Low</option>
          <option value="mid">Mid</option>
          <option value="high">High</option>
        </select>
      </section>

      <section className="chip-row" style={{ marginBottom: "24px" }}>
        {filters.map((filter) => (
          <button
            className={`chip ${activeFilter === filter ? "active" : ""}`}
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </section>

      <section className="stories-row">
        {state.stories.map((story) => (
          <article className="story-card" key={story.id}>
            <div className="nav-avatar">{getInitials(story.authorName)}</div>
            <strong>{story.authorName}</strong>
            <span>{story.destination}</span>
          </article>
        ))}
      </section>

      <div className="feed-layout">
        <div className="stack">
          <section className="panel-card">
            <div className="panel-row">
              <h2 className="section-title">Destination Discovery</h2>
              <span className="text-muted">{filteredDestinations.length} destinations</span>
            </div>
            <div className="destination-grid">
              {filteredDestinations.map((destination) => {
                const saved = state.bookmarkedDestinationIds.includes(destination.id);
                return (
                  <article className="destination-card" key={destination.id}>
                    <div className="detail-row">
                      <div>
                        <strong>{destination.name}</strong>
                        <p className="text-muted">{destination.region}</p>
                      </div>
                      <div className="tag-row">
                        <button className={`chip ${saved ? "active" : ""}`} onClick={() => toggleDestinationBookmark(destination.id)} type="button">
                          {saved ? "Saved" : "Save"}
                        </button>
                        {saved ? (
                          <button className="chip" onClick={() => toggleDestinationBookmark(destination.id)} type="button">
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <p>{destination.summary}</p>
                    <div className="tag-row">
                      <span className="tag">{destination.budget} budget</span>
                      <span className="tag">{destination.season}</span>
                      <span className="tag">{destination.groupSize}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {filteredPosts.map((post) => {
            const liked = !!post.likedBy?.includes(user?.uid || "");
            const bookmarked = !!post.bookmarkedBy?.includes(user?.uid || "");
            const canDeletePost =
              post.authorId === user?.uid || profile?.role === "admin" || profile?.role === "superadmin";
            return (
              <article className="post-card" key={post.id}>
                <div className="post-header">
                  <div className="post-author">
                    <div className="nav-avatar" style={{ background: post.authorColor || "#FF6B6B" }}>
                      {getInitials(post.authorName)}
                    </div>
                    <div>
                      <strong>{post.authorName}</strong>
                      <p className="text-muted">{relativeDate(post.createdAt)}</p>
                    </div>
                  </div>
                  {post.authorId && post.authorId !== currentUserState?.uid ? (
                    <button className={`chip ${state.followedUserIds.includes(post.authorId) ? "active" : ""}`} onClick={() => toggleFollow(post.authorId || "")} type="button">
                      {state.followedUserIds.includes(post.authorId) ? "Following" : "Follow"}
                    </button>
                  ) : null}
                </div>
                <div
                  className={`post-banner ${post.image ? "post-banner-with-image" : ""}`}
                  style={
                    post.image
                      ? { backgroundImage: `linear-gradient(rgba(18, 31, 44, 0.2), rgba(18, 31, 44, 0.55)), url(${normalizeImageUrl(post.image)})` }
                      : undefined
                  }
                >
                  <span>{post.emoji || "Post"}</span>
                  <em>{post.destination}</em>
                </div>
                <div className="post-body post-body-stack">
                  <p>{post.caption}</p>
                  <div className="tag-row">
                    {(post.tags || []).map((tag) => (
                      <span className="tag" key={`${post.id}-${tag}`}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="post-actions">
                    <button className={`chip ${liked ? "active" : ""}`} onClick={() => void toggleLikePost(post.id)} type="button">
                      {liked ? "Liked" : "Like"} ({post.likes || 0})
                    </button>
                    <button className={`chip ${bookmarked ? "active" : ""}`} onClick={() => void toggleBookmarkPost(post.id)} type="button">
                      {bookmarked ? "Bookmarked" : "Bookmark"}
                    </button>
                    <button
                      className="chip"
                      onClick={() => {
                        window.navigator.clipboard.writeText(`${window.location.origin}/explore#post-${post.id}`);
                        showToast("Post link copied.");
                      }}
                      type="button"
                    >
                      Share Link
                    </button>
                    {canDeletePost ? (
                      <button className="chip" onClick={() => void handleDeletePost(post.id, post.destination)} type="button">
                        Delete
                      </button>
                    ) : null}
                  </div>
                  <div className="stack">
                    {(post.commentItems || []).slice(0, 2).map((comment) => (
                      <div className="detail-row" key={comment.id}>
                        <strong>{comment.authorName}</strong>
                        <span>{comment.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="inline-form">
                    <input className="form-control" placeholder="Add comment" value={commentDrafts[post.id] || ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} />
                    <button className="btn btn-primary btn-sm" onClick={() => void handleAddComment(post.id)} type="button">
                      Comment
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="sidebar-card">
          <h3 className="section-title">Suggested Travelers</h3>
          <div className="stack">
            {suggestedTravelers.map((traveler) => (
              <div className="detail-row" key={traveler.uid}>
                <div>
                  <strong>{traveler.name}</strong>
                  <p className="text-muted">{traveler.location || "Global"}</p>
                </div>
                <button className={`chip ${state.followedUserIds.includes(traveler.uid) ? "active" : ""}`} onClick={() => toggleFollow(traveler.uid)} type="button">
                  {state.followedUserIds.includes(traveler.uid) ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>
          <h3 className="section-title">Trending Destinations</h3>
          <div className="tag-row">
            {state.destinations.slice(0, 4).map((destination) => (
              <span className="tag" key={destination.id}>
                {destination.name}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
