import express from "express";
import { Shareholder } from "../models/Shareholder.js"; // Make sure file name matches exactly

const router = express.Router();

// GET all shareholders with pagination
router.get("/", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const all = Shareholder.getAll();
  const start = (page - 1) * limit;
  const paginated = all.slice(start, start + limit);
  res.json({ data: paginated, page, limit, total: all.length });
});

// GET shareholder by ID
router.get("/:id", (req, res) => {
  const item = Shareholder.getById(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

// POST create new shareholder
router.post("/", (req, res) => {
  try {
    const created = Shareholder.create(req.body);
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PUT update shareholder by ID
router.put("/:id", (req, res) => {
  const updated = Shareholder.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

// DELETE shareholder by ID
router.delete("/:id", (req, res) => {
  const deleted = Shareholder.delete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.json({ success: true });
});

export default router;
