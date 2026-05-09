import { create } from "zustand";

export interface BudgetRowOverride {
  budgetCode: string;
  wastePct: number;
  marginPct: number;
  unitLabourMins: number;
  difficultyFactor: number;
  notes: string;
  isTaxable: boolean;
}

/** Sensible per-product labour defaults (mins per unit) */
const PRODUCT_LABOUR_DEFAULTS: Record<string, number> = {
  "porcelain-tiles": 45,
  "engineered-wood": 30,
  carpet: 20,
  "plasterboard-ceiling": 35,
  "wall-tiles": 40,
  "partition-wall": 120,
  "external-brickwork": 150,
};

export function defaultOverride(productId: string): BudgetRowOverride {
  return {
    budgetCode: "",
    wastePct: 10,
    marginPct: 20,
    unitLabourMins: PRODUCT_LABOUR_DEFAULTS[productId] ?? 0,
    difficultyFactor: 1.0,
    notes: "",
    isTaxable: true,
  };
}

interface BudgetStore {
  overrides: Record<string, BudgetRowOverride>;
  labourHourlyRate: number;
  getOverride: (id: string, productId: string) => BudgetRowOverride;
  setOverride: (id: string, productId: string, patch: Partial<BudgetRowOverride>) => void;
  setLabourHourlyRate: (rate: number) => void;
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  overrides: {},
  labourHourlyRate: 35,

  getOverride: (id, productId) =>
    get().overrides[id] ?? defaultOverride(productId),

  setOverride: (id, productId, patch) =>
    set((state) => ({
      overrides: {
        ...state.overrides,
        [id]: {
          ...(state.overrides[id] ?? defaultOverride(productId)),
          ...patch,
        },
      },
    })),

  setLabourHourlyRate: (rate) => set({ labourHourlyRate: rate }),
}));
