import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getMarketData } from "./routes/market";
import { addEmail, listEmails } from "./routes/email";
import { connectDB } from "./db.js";
import shareholdersRouter from "./routes/shareholderRoutes.js";
import dmatRouter from "./routes/dmatRoutes.js";
import clientProfilesRouter from "./routes/clientProfileRoutes.js";
import mongoose from "mongoose";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Market data (mock; integrate Moneycontrol/NSE by replacing implementation)
  app.get("/api/market", getMarketData);

  // Email log (mock)
  app.get("/api/email", listEmails);
  app.post("/api/email", addEmail);

  // Connect to Mongo (no-op if MONGODB_URI is not set)
  connectDB();

  // Mongo-backed CRUD APIs (only if DB configured)
  if (process.env.MONGODB_URI) {
    const ensureDB: import("express").RequestHandler = (_req, res, next) => {
      // 1 = connected, 2 = connecting, 0 = disconnected
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

  return app;
}
