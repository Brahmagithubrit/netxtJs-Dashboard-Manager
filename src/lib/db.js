// Mongoose connection helper (ES module)
import mongoose from "mongoose";

// Use a global cache to avoid creating multiple connections in development/hot-reload
const globalForMongoose = globalThis;
if (!globalForMongoose._mongoose) {
  globalForMongoose._mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB using Mongoose.
 *
 * - Reads MongoDB URI from process.env.MONGODB_URI (recommended)
 * - Falls back to mongodb://127.0.0.1:27017/task if not provided
 * - Caches the connection and promise to avoid multiple connections during HMR
 * - Clears cached.promise if connection fails so future attempts can retry
 *
 * @returns {Promise<mongoose.Mongoose>} The connected mongoose instance
 */
export async function connect_db() {
  // Prefer env var; keep a safe local fallback for local development
  const uri =
   process.env.NEXT_PUBLIC_DB_URL ||
    "mongodb://127.0.0.1:27017/task";

  // Basic safety: do not log credentials
  const safeUri = uri.replace(/(:).*(@)/, ":****$2");
  console.log("🟢 [DB] connect_db() called");
  console.log("🔵 [DB] Using MongoDB URI:", safeUri);

  const cached = globalForMongoose._mongoose;

  if (cached.conn) {
    console.log("✅ [DB] Using existing cached connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("� [DB] Creating new mongoose connection promise...");
    cached.promise = mongoose
      .connect(uri, {
        // Recommended options can be passed here; keep minimal to be resilient
        // useNewUrlParser/useUnifiedTopology are defaults in Mongoose 6+
        serverSelectionTimeoutMS: 5000,
      })
      .then((m) => {
        console.log("✅ [DB] Mongoose connected");
        console.log("🔍 [DB] Host:", m.connection.host);
        console.log("🔍 [DB] DB Name:", m.connection.name);
        return m;
      })
      .catch((err) => {
        // Clear the promise so subsequent calls can retry
        console.error("❌ [DB] Mongoose connection error:", err.message);
        cached.promise = null;
        throw err;
      });
  } else {
    console.log("🟠 [DB] Awaiting existing connection promise");
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    console.error("❌ [DB] Failed to connect to MongoDB:", err.message);
    throw err;
  }
}
