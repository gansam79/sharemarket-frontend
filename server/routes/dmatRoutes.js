import express from "express";
import DmatAccount from "../models/DmatAccount.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    DmatAccount.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    DmatAccount.countDocuments(),
  ]);
  res.json({ data: items, page, limit, total });
});

router.get("/:id", async (req, res) => {
  const item = await DmatAccount.findById(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

router.post("/", async (req, res) => {
  try {
    const { accountNumber, holderName, expiryDate, renewalStatus } = req.body || {};
    const created = await DmatAccount.create({ accountNumber, holderName, expiryDate, renewalStatus });
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await DmatAccount.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  const deleted = await DmatAccount.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.json({ success: true });
});

export default router;
