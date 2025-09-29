import { RequestHandler } from "express";
import type { MarketDataResponse } from "@shared/api";

export const getMarketData: RequestHandler = (req, res) => {
  const symbol = String(req.query.symbol || "NIFTY").toUpperCase();
  const price = 100 + Math.random() * 100;
  const change = (Math.random() - 0.5) * 2;
  const history = Array.from({ length: 30 }).map((_, i) => ({
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    close: price + (Math.sin(i / 5) * 5) + (Math.random() - 0.5) * 2,
  })).reverse();
  const payload: MarketDataResponse = {
    live: { symbol, price: Math.round(price * 100) / 100, change: Math.round(change * 100) / 100 },
    history,
  };
  res.json(payload);
};
