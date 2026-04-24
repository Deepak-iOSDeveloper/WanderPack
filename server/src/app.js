import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { requestLogger, detailedLogger } from "./middleware/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import healthRoutes from "./routes/health.routes.js";
import tripsRoutes from "./routes/trips.routes.js";
import usersRoutes from "./routes/users.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import postsRoutes from "./routes/posts.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import supportRoutes from "./routes/support.routes.js";

dotenv.config();

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || "http://127.0.0.1:5173,http://127.0.0.1:5174")
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean);

// ============ MIDDLEWARE ============
// CORS
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);

// Body parser
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// Logging
app.use(requestLogger);
if (process.env.NODE_ENV === "development") {
  app.use(detailedLogger);
}

// ============ ROUTES ============
app.get("/", (_request, response) => {
  response.json({
    ok: true,
    message: "WanderPack backend is running.",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/trips", tripsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/activity-log", activityRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/support-tickets", supportRoutes);

// ============ ERROR HANDLING ============
// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
