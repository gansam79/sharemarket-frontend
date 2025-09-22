/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

export type Role = "Admin" | "Shareholder" | "Stockholder";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface DmatAccount {
  id: string;
  accountNumber: string;
  holderName: string;
  expiryDate: string; // ISO date
  renewalStatus: "Active" | "Expiring" | "Expired";
}

export type PersonType = "Shareholder" | "Stockholder";

export interface Person {
  id: string;
  type: PersonType;
  name: string;
  email: string;
  phone: string;
  pan: string;
  dmatAccountId?: string;
}

export type TransferStatus = "Initiated" | "In-Process" | "Completed";

export interface Transfer {
  id: string;
  personId: string;
  personType: PersonType;
  personName: string;
  company: string;
  transferDate: string; // ISO date
  status: TransferStatus;
  expectedCreditDate?: string; // ISO date
  movedToIPF?: boolean;
  dividendsReceived?: number; // currency
  pendingDividends?: number; // currency
  bonusShares?: number; // count
}

export interface EmailLogEntry {
  id: string;
  to: string;
  subject: string;
  bodyPreview: string;
  createdAt: string; // ISO date
}

export interface LivePrice {
  symbol: string;
  price: number;
  change: number; // percentage, e.g., -0.52
}

export interface HistoricalPoint {
  date: string; // ISO date
  close: number;
}

export interface MarketDataResponse {
  live: LivePrice;
  history: HistoricalPoint[];
}

export interface ReportInput {
  symbol: string;
  quantity: number;
  buyAmount: number; // total buy amount
}

export interface ReportOutput {
  expectedDividends: number;
  bonusAllocation: number;
  remainingDues: number;
}

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/** Utility shared functions */
export function calculateIPFDetails(params: {
  dividendsHistory?: number[];
  bonusRatio?: number; // e.g., 0.1 means 1 bonus share per 10
  quantity?: number;
}): { dividendsReceived: number; pendingDividends: number; bonusShares: number } {
  const dividends = params.dividendsHistory ?? [];
  const received = dividends.reduce((a, b) => a + b, 0);
  const expected = dividends.length > 0 ? dividends.length * (dividends.reduce((a, b) => a + b, 0) / dividends.length) : 0;
  const pending = Math.max(0, expected - received);
  const bonusShares = Math.floor((params.quantity ?? 0) * (params.bonusRatio ?? 0));
  return { dividendsReceived: received, pendingDividends: pending, bonusShares };
}
