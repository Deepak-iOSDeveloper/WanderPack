import dotenv from "dotenv";
import app from "./app.js";
import { connectToDatabase } from "./config/db.js";

dotenv.config();

const port = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    // Connect to database
    await connectToDatabase();
    console.log("✅ Database connection established");

    // Start server
    const server = app.listen(port, () => {
      console.log(`✅ WanderPack backend listening on http://127.0.0.1:${port}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🗄️  Database: ${process.env.MONGODB_URI?.split("/").pop() || "unknown"}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("⚠️  SIGTERM signal received: closing HTTP server");
      server.close(() => {
        console.log("✅ HTTP server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("⚠️  SIGINT signal received: closing HTTP server");
      server.close(() => {
        console.log("✅ HTTP server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Failed to start backend:", error.message);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    process.exit(1);
  }
}

void startServer();
