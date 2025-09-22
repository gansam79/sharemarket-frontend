import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import shareholderRoutes from "./routes/shareholderRoutes.js";
import dmatRoutes from "./routes/dmatRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/ping", (_req, res) => res.json({ message: "pong" }));
app.use("/api/shareholders", shareholderRoutes);
app.use("/api/dmat", dmatRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Express API running on http://localhost:${PORT}`));
});

export default app;
