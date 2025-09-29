import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

mongoose.set("strictQuery", true);
mongoose.set("bufferCommands", false);

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "ShareMarket";

export async function connectDB() {
  if (!uri) {
    console.warn("❌ MONGODB_URI not set; skipping DB connection");
    return;
  }

  // Prevent duplicate connections
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(uri, { dbName });
    console.log(`✅ MongoDB connected to database: ${dbName}`);
  } catch (err) {
    console.error("❌ MongoDB connection error", err.message);
    process.exit(1); // Stop the server if DB connection fails
  }
}

export function isDBConnected() {
  return mongoose.connection.readyState === 1;
}

export default mongoose;
