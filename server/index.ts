import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import { handleDemo } from "./routes/demo.js";
import { getMarketData } from "./routes/market.js";
import { addEmail, listEmails } from "./routes/email.js";
import { connectDB } from "./db.js";

import shareholdersRouter from "./routes/shareholderRoutes.js";
import dmatRouter from "./routes/dmatRoutes.js";
import clientProfilesRouter from "./routes/clientProfileRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Health check / simple test
app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from backend" });
});

// ✅ Example API routes
app.get("/api/ping", (_req, res) => {
  const ping = process.env.PING_MESSAGE ?? "ping";
  res.json({ message: ping });
});

app.get("/api/demo", handleDemo);

// Market data (mock for now)
app.get("/api/market", getMarketData);

// Email log (mock)
app.get("/api/email", listEmails);
app.post("/api/email", addEmail);

// ✅ Connect to MongoDB
connectDB();

// Mongo-backed CRUD APIs (only if DB configured)
if (process.env.MONGODB_URI) {
  const ensureDB: import("express").RequestHandler = (_req, res, next) => {
    const state = mongoose.connection.readyState;
    if (state !== 1) {
      return res.status(503).json({ error: "Database not connected" });
    }
    next();
  };

  app.use("/api/shareholders", ensureDB, shareholdersRouter);
  app.use("/api/dmat", ensureDB, dmatRouter);
  app.use("/api/client-profiles", ensureDB, clientProfilesRouter);
}

export default app;
