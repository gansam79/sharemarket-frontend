import { RequestHandler } from "express";
import type { EmailLogEntry } from "@shared/api";

const log: EmailLogEntry[] = [];

export const listEmails: RequestHandler = (_req, res) => {
  res.json(log);
};

export const addEmail: RequestHandler = (req, res) => {
  const { to, subject, bodyPreview } = req.body || {};
  const entry: EmailLogEntry = {
    id: `em_${Math.random().toString(36).slice(2, 9)}`,
    to: String(to ?? "unknown"),
    subject: String(subject ?? ""),
    bodyPreview: String(bodyPreview ?? ""),
    createdAt: new Date().toISOString(),
  };
  log.unshift(entry);
  res.status(201).json(entry);
};
