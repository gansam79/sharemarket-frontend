import express from "express";
import ClientProfile from "../models/ClientProfile.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;
  const q = (req.query.q || "").toString().trim();
  const filter = q
    ? {
        $or: [
          { "shareholderName.name1": { $regex: q, $options: "i" } },
          { panNumber: { $regex: q, $options: "i" } },
          { companyName: { $regex: q, $options: "i" } },
        ],
      }
    : {};
  const [items, total] = await Promise.all([
    ClientProfile.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ClientProfile.countDocuments(filter),
  ]);
  res.json({ data: items, page, limit, total });
});

router.get("/:id", async (req, res) => {
  const item = await ClientProfile.findById(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

router.post("/", async (req, res) => {
  try {
    const created = await ClientProfile.create(req.body);
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await ClientProfile.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  const deleted = await ClientProfile.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.json({ success: true });
});

export default router;
