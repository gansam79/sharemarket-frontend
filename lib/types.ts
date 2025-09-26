// /types/types.ts

export interface BankDetails {
  bankNumber?: string;
  branch?: string;
  bankName?: string;
  ifscCode?: string;
  micrCode?: string;
}

export interface Distinctive { from?: string; to?: string }

export interface Dividend { amount?: number; date?: string }

export interface ShareholderName { name1: string; name2?: string; name3?: string }

export interface ShareHolding {
  companyName: string;
  isinNumber: string;
  folioNumber: string;
  certificateNumber: string;
  distinctiveNumber: Distinctive;
  quantity: number;
  faceValue: number;
  purchaseDate?: string;
}

export interface ClientProfile {
  _id: string;
  shareholderName: ShareholderName;
  panNumber: string;
  address?: string;
  bankDetails?: BankDetails;
  dematAccountNumber?: string;
  shareHoldings: ShareHolding[];
  currentDate?: string;
  status: "Active" | "Closed" | "Pending" | "Suspended";
  remarks?: string;
  dividend?: Dividend;
}

export type Payload = Omit<ClientProfile, "_id">;

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}
