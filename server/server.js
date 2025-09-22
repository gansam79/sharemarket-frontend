import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import shareholderRoutes from "./routes/shareholderRoutes.js";
import dmatRoutes from "./routes/dmatRoutes.js";
import clientProfileRoutes from "./routes/clientProfileRoutes.js"; // make sure this matches your router file

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test endpoint
app.get("/api/ping", (_req, res) => res.json({ message: "pong" }));

// Register routes
app.use("/api/shareholders", shareholderRoutes);
app.use("/api/dmat", dmatRoutes);
app.use("/api/client-profiles", clientProfileRoutes); // ✅ correctly using imported router

// Start server after DB connection
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Express API running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Failed to connect to DB:", err);
    process.exit(1);
  });

export default app;
