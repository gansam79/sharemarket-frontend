import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { DmatAccount, EmailLogEntry, Person, ReportInput, ReportOutput, Role, Transfer, User } from "@shared/api";

interface AppState {
  currentUser: User | null;
  people: Person[];
  dmatAccounts: DmatAccount[];
  transfers: Transfer[];
  emailLog: EmailLogEntry[];
}

type Action =
  | { type: "SIGN_IN"; payload: User }
  | { type: "SIGN_OUT" }
  | { type: "UPSERT_PERSON"; payload: Person }
  | { type: "DELETE_PERSON"; payload: string }
  | { type: "UPSERT_DMAT"; payload: DmatAccount }
  | { type: "DELETE_DMAT"; payload: string }
  | { type: "UPSERT_TRANSFER"; payload: Transfer }
  | { type: "UPSERT_EMAIL_LOG"; payload: EmailLogEntry[] }
  | { type: "SEED"; payload: Partial<AppState> };

const initialState: AppState = {
  currentUser: null,
  people: [],
  dmatAccounts: [],
  transfers: [],
  emailLog: [],
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SIGN_IN":
      return { ...state, currentUser: action.payload };
    case "SIGN_OUT":
      return { ...state, currentUser: null };
    case "UPSERT_PERSON":
      return {
        ...state,
        people: upsert(state.people, action.payload, (i) => i.id),
      };
    case "DELETE_PERSON":
      return { ...state, people: state.people.filter((p) => p.id !== action.payload) };
    case "UPSERT_DMAT":
      return {
        ...state,
        dmatAccounts: upsert(state.dmatAccounts, action.payload, (i) => i.id),
      };
    case "DELETE_DMAT":
      return { ...state, dmatAccounts: state.dmatAccounts.filter((d) => d.id !== action.payload) };
    case "UPSERT_TRANSFER":
      return {
        ...state,
        transfers: upsert(state.transfers, action.payload, (i) => i.id),
      };
    case "UPSERT_EMAIL_LOG":
      return { ...state, emailLog: action.payload };
    case "SEED":
      return { ...state, ...action.payload } as AppState;
    default:
      return state;
  }
}

function upsert<T>(arr: T[], item: T, key: (i: T) => string): T[] {
  const k = key(item);
  const idx = arr.findIndex((i) => key(i) === k);
  if (idx === -1) return [...arr, item];
  const next = arr.slice();
  next[idx] = item;
  return next;
}

const StoreContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action>; isAdmin: boolean; role: Role | null } | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const raw = localStorage.getItem("smmpro-state");
      if (!raw) return init;
      return { ...init, ...JSON.parse(raw) } as AppState;
    } catch {
      return init;
    }
  });

  useEffect(() => {
    localStorage.setItem("smmpro-state", JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const alreadySeeded = (state.people.length + state.dmatAccounts.length + state.transfers.length) > 0;
    if (alreadySeeded) return;

    const base = [
      { name: "Akanksha D.", email: "shareholder@smmpro.app", type: "Shareholder" as const },
      { name: "Rahul K.", email: "rahul@example.com", type: "Stockholder" as const },
      { name: "Meera S.", email: "meera@example.com", type: "Shareholder" as const },
      { name: "Arjun P.", email: "arjun@example.com", type: "Stockholder" as const },
      { name: "Priya N.", email: "priya@example.com", type: "Shareholder" as const },
      { name: "Vikram R.", email: "vikram@example.com", type: "Stockholder" as const },
      { name: "Sneha T.", email: "sneha@example.com", type: "Shareholder" as const },
      { name: "Rohit M.", email: "rohit@example.com", type: "Stockholder" as const },
      { name: "Isha K.", email: "isha@example.com", type: "Shareholder" as const },
      { name: "Karan L.", email: "karan@example.com", type: "Stockholder" as const },
      { name: "Devika B.", email: "devika@example.com", type: "Shareholder" as const },
      { name: "Nitin H.", email: "stockholder@smmpro.app", type: "Stockholder" as const },
    ];

    const people: Person[] = base.map((b, i) => ({
      id: createId("p"),
      type: b.type,
      name: b.name,
      email: b.email,
      phone: `98${(700000000 + i * 12345).toString().slice(0, 8)}`,
      pan: `${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i+3) % 26))}${String.fromCharCode(65 + ((i+7) % 26))}${String.fromCharCode(65 + ((i+11) % 26))}${String.fromCharCode(65 + ((i+15) % 26))}${(1000 + i).toString().slice(1)}${String.fromCharCode(65 + ((i+19) % 26))}`,
    }));

    const now = Date.now();
    const dmat: DmatAccount[] = people.slice(0, 10).map((p, i) => {
      const days = [-20, -5, 3, 7, 12, 25, 40, 60, 1, 9][i];
      const expiry = new Date(now + days * 24 * 60 * 60 * 1000).toISOString();
      const renewalStatus = days < 0 ? "Expired" : days <= 10 ? "Expiring" : "Active";
      return {
        id: createId("d"),
        accountNumber: `DMAT-${(i + 1).toString().padStart(3, "0")}`,
        holderName: p.name,
        expiryDate: expiry,
        renewalStatus,
      } as DmatAccount;
    });

    // link first 10 people to dmat accounts
    for (let i = 0; i < 10; i++) {
      people[i] = { ...people[i], dmatAccountId: dmat[i].id };
    }

    const t1: Transfer = { id: createId("tr"), personId: people[0].id, personType: people[0].type, personName: people[0].name, company: "INFY", transferDate: new Date().toISOString(), status: "In-Process", expectedCreditDate: new Date(now + 3*24*60*60*1000).toISOString(), movedToIPF: false };
    const t2: Transfer = { id: createId("tr"), personId: people[1].id, personType: people[1].type, personName: people[1].name, company: "TCS", transferDate: new Date().toISOString(), status: "Completed", movedToIPF: true, dividendsReceived: 320.5, pendingDividends: 120.0, bonusShares: 1 };

    dispatch({ type: "SEED", payload: { people, dmatAccounts: dmat, transfers: [t1, t2] } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAdmin = state.currentUser?.role === "Admin";
  const role = state.currentUser?.role ?? null;

  const value = useMemo(() => ({ state, dispatch, isAdmin, role }), [state, isAdmin, role]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function createId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function calculateReport(input: ReportInput): ReportOutput {
  const expectedDividends = Math.round(input.quantity * 2.5 * 100) / 100;
  const bonusAllocation = Math.floor(input.quantity * 0.1);
  const remainingDues = Math.max(0, input.buyAmount - input.quantity * 2.5);
  return { expectedDividends, bonusAllocation, remainingDues };
}
