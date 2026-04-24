import mongoose from "mongoose";

const REQUIRED_COLLECTIONS = [
  "users",
  "trips",
  "posts",
  "notifications",
  "activityLog",
  "bookings",
  "wishlist",
  "supportTickets",
];

async function ensureCollectionsExist() {
  const database = mongoose.connection.db;

  if (!database) {
    return;
  }

  const existingCollections = await database.listCollections().toArray();
  const existingNames = new Set(existingCollections.map((entry) => entry.name));

  for (const collectionName of REQUIRED_COLLECTIONS) {
    if (!existingNames.has(collectionName)) {
      await database.createCollection(collectionName);
      console.log(`Created MongoDB collection: ${collectionName}`);
    }
  }
}

/**
 * Connect to MongoDB
 */
export async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "Missing MONGODB_URI environment variable. " +
        "Please add it to server/.env file. " +
        "Example: MONGODB_URI=mongodb://localhost:27017/wanderpack",
    );
  }

  try {
    // ✅ ADD THESE CONNECTION OPTIONS
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,    // Timeout after 5 seconds instead of 30
      socketTimeoutMS: 45000,            // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000,           // Give up initial connection after 10 seconds
      maxPoolSize: 10,                   // Maintain up to 10 socket connections
      retryWrites: true,                 // Retry failed writes
      retryReads: true,                  // Retry failed reads
    });

    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("✅ MongoDB connected successfully");
    });

    connection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error.message);
    });

    connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });

    // Optional: Wait for connection to be established before creating collections
    if (connection.readyState === 1) { // 1 = connected
      await ensureCollectionsExist();
    } else {
      // Wait for connection if not ready
      await new Promise((resolve) => {
        connection.once("connected", resolve);
      });
      await ensureCollectionsExist();
    }

    return connection;
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error.message);
    // Log additional debug info
    if (error.name === 'MongooseServerSelectionError') {
      console.error("\n🔍 Debug Tips:");
      console.error("1. Check your IP is whitelisted in MongoDB Atlas");
      console.error("2. Verify your username/password in the connection string");
      console.error("3. Make sure the database name is correct");
      console.error("4. Try adding /?retryWrites=true&w=majority to your URI");
      console.error("5. Check if you need to configure network access in Atlas\n");
    }
    throw error;
  }
}

/**
 * Disconnect from MongoDB (for graceful shutdown)
 */
export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error.message);
    throw error;
  }
}