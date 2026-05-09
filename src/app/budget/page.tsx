"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useAnnotationStore } from "@/store/annotationStore";
import { useProductStore } from "@/store/productStore";
import { useBudgetStore, type BudgetRowOverride } from "@/store/budgetStore";
import { PRODUCTS } from "@/data/products";
import type { Product } from "@/types/product";

// ─── Demo fallback data (shown when no takeoff annotations exist) ─────────────

const DEMO_MEASUREMENTS: Record<string, number> = {
  "porcelain-tiles": 85.5,
  "engineered-wood": 32.2,
  carpet: 48.0,
  "plasterboard-ceiling": 120.0,
  "wall-tiles": 24.5,
  "partition-wall": 18.3,
  "external-brickwork": 45.0,
};

const DEMO_BUDGET_CODES: Record<string, string> = {
  "porcelain-tiles": "FL-001",
  "engineered-wood": "FL-002",
  carpet: "FL-003",
  "plasterboard-ceiling": "CE-001",
  "wall-tiles": "WL-001",
  "partition-wall": "WL-002",
  "external-brickwork": "EX-001",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type BudgetSource = {
  id: string;
  product: Product;
  measurement: number;
  unit: "m2" | "m";
  isDemo: boolean;
};

type ComputedRow = {
  source: BudgetSource;
  override: BudgetRowOverride;
  qty: number;
  unitCost: number;
  subtotalItemCost: number;
  unitSales: number;
  subtotalItemSales: number;
  profit: number;
  totalLabourHrs: number;
  totalLabourCost: number;
};

// ─── Calculations ─────────────────────────────────────────────────────────────

function computeRow(
  source: BudgetSource,
  override: BudgetRowOverride,
  labourHourlyRate: number
): ComputedRow {
  const qty = source.measurement;
  const unitCost = source.product.unitPrice;
  const wasteFactor = 1 + override.wastePct / 100;
  const subtotalItemCost = qty * unitCost * wasteFactor;
  const marginFraction = Math.min(override.marginPct / 100, 0.9999);
  const unitSales = (unitCost * wasteFactor) / (1 - marginFraction);
  const subtotalItemSales = qty * unitSales;
  const profit = subtotalItemSales - subtotalItemCost;
  const totalLabourHrs =
    (qty * override.unitLabourMins * override.difficultyFactor) / 60;
  const totalLabourCost = totalLabourHrs * labourHourlyRate;
  return {
    source,
    override,
    qty,
    unitCost,
    subtotalItemCost,
    unitSales,
    subtotalItemSales,
    profit,
    totalLabourHrs,
    totalLabourCost,
  };
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function gbp(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function num(n: number, dp = 2) {
  return n.toFixed(dp);
}

// ─── Small shared UI ──────────────────────────────────────────────────────────

const cellInput =
  "w-full bg-transparent text-right text-white focus:outline-none focus:ring-1 focus:ring-teal-400 rounded px-1 py-0.5 hover:bg-slate-700 transition-colors text-sm";

const readCell = "text-right text-sm text-slate-200 px-3 py-2 whitespace-nowrap";

function NumCell({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const step = value < 10 ? 0.1 : 1;
  return (
    <td className="px-2 py-1.5">
      <div className="inline-flex items-center gap-0">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, parseFloat((value - step).toFixed(4))))}
          className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-600 hover:text-white transition-colors text-xs leading-none"
        >
          −
        </button>
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-10 bg-transparent text-center text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-400 rounded py-0.5 hover:bg-slate-700 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => onChange(parseFloat((value + step).toFixed(4)))}
          className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-600 hover:text-white transition-colors text-xs leading-none"
        >
          +
        </button>
      </div>
    </td>
  );
}

function TextCell({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <td className="px-2 py-2">
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${cellInput} text-left`}
      />
    </td>
  );
}

// ─── Row Detail Modal ─────────────────────────────────────────────────────────

function RowDetailModal({
  row,
  onClose,
}: {
  row: ComputedRow;
  onClose: () => void;
}) {
  const { source, override, qty, unitCost, subtotalItemCost, unitSales, subtotalItemSales, profit, totalLabourHrs, totalLabourCost } = row;
  const { product } = source;

  function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-teal-400">
          {title}
        </h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">{children}</dl>
      </div>
    );
  }

  function Row({ label, value }: { label: string; value: ReactNode }) {
    return (
      <div>
        <dt className="text-xs text-slate-500">{label}</dt>
        <dd className="text-sm font-medium text-slate-100">{value}</dd>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-600 bg-slate-800 p-6 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <span
            className="h-4 w-4 shrink-0 rounded-full"
            style={{ background: product.colorHex }}
          />
          <h2 className="text-xl font-semibold text-white">{product.name}</h2>
          <span className="ml-auto rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
            {product.category}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-600 px-3 py-1 text-sm text-slate-300 hover:bg-slate-700"
          >
            Close
          </button>
        </div>

        <div className="space-y-5">
          <Section title="Item">
            <Row label="Budget Code" value={override.budgetCode || "—"} />
            <Row label="Product ID" value={product.id} />
            <Row label="Category" value={product.category} />
            <Row label="Unit" value={source.unit === "m2" ? "m²" : "m"} />
            <Row label="Source" value={source.isDemo ? "Demo" : "Takeoff"} />
          </Section>

          <Section title="Costs">
            <Row label="Quantity" value={`${gbp(qty)} ${source.unit === "m2" ? "m²" : "m"}`} />
            <Row label="Unit Cost" value={`£${gbp(unitCost)}`} />
            <Row label="Waste (%)" value={`${num(override.wastePct)}%`} />
            <Row label="Subtotal Item Cost" value={`£${gbp(subtotalItemCost)}`} />
          </Section>

          <Section title="Sales">
            <Row label="Margin (%)" value={`${num(override.marginPct)}%`} />
            <Row label="Unit Sales" value={`£${gbp(unitSales)}`} />
            <Row label="Subtotal Item Sales" value={`£${gbp(subtotalItemSales)}`} />
            <Row label="Profit" value={`£${gbp(profit)}`} />
          </Section>

          <Section title="Labour">
            <Row label="Unit Labour (mins)" value={num(override.unitLabourMins)} />
            <Row label="Difficulty Factor" value={`${num(override.difficultyFactor)}×`} />
            <Row label="Total Labour (hrs)" value={num(totalLabourHrs)} />
            <Row label="Total Labour Cost" value={`£${gbp(totalLabourCost)}`} />
          </Section>

          <Section title="Other">
            <Row label="Tax" value={override.isTaxable ? "Yes" : "No"} />
            <Row label="Notes" value={override.notes || "—"} />
          </Section>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function BudgetPage() {
  const annotations = useAnnotationStore((s) => s.annotations);
  const calibration = useAnnotationStore((s) => s.scaleCalibration);
  const getTakeoffs = useProductStore((s) => s.getTakeoffs);
  const getOverride = useBudgetStore((s) => s.getOverride);
  const setOverride = useBudgetStore((s) => s.setOverride);
  const labourHourlyRate = useBudgetStore((s) => s.labourHourlyRate);
  const setLabourHourlyRate = useBudgetStore((s) => s.setLabourHourlyRate);
  const overrides = useBudgetStore((s) => s.overrides);

  const [activeModal, setActiveModal] = useState<ComputedRow | null>(null);

  // Live takeoff lines from drawing store
  const takeoffLines = useMemo(
    () => getTakeoffs(annotations, calibration),
    [annotations, calibration, getTakeoffs]
  );

  const isDemo = takeoffLines.length === 0;

  // Build sources (real or demo)
  // Real data is always grouped by product so budget shows one row per product type.
  const sources = useMemo<BudgetSource[]>(() => {
    if (!isDemo) {
      const groupMap = new Map<
        string,
        { product: Product; totalMeasurement: number; unit: "m2" | "m" }
      >();
      for (const tl of takeoffLines) {
        const pid = tl.product.id;
        const ex = groupMap.get(pid);
        if (ex) {
          ex.totalMeasurement += tl.measurement;
        } else {
          groupMap.set(pid, {
            product: tl.product,
            totalMeasurement: tl.measurement,
            unit: tl.unit,
          });
        }
      }
      return Array.from(groupMap.values()).map((g) => ({
        id: `grouped-${g.product.id}`,
        product: g.product,
        measurement: g.totalMeasurement,
        unit: g.unit,
        isDemo: false,
      }));
    }
    return PRODUCTS.map((p) => ({
      id: `demo-${p.id}`,
      product: p,
      measurement: DEMO_MEASUREMENTS[p.id] ?? 10,
      unit: p.unit as "m2" | "m",
      isDemo: true,
    }));
  }, [takeoffLines, isDemo]);

  // Computed rows (reactive to store changes)
  const rows = useMemo<ComputedRow[]>(
    () =>
      sources.map((src) => {
        const override = getOverride(src.id, src.product.id);
        // Seed demo budget codes if not yet set
        if (src.isDemo && !override.budgetCode) {
          override.budgetCode = DEMO_BUDGET_CODES[src.product.id] ?? "";
        }
        return computeRow(src, override, labourHourlyRate);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sources, getOverride, labourHourlyRate, overrides]
  );

  // Totals
  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        subtotalItemCost: acc.subtotalItemCost + r.subtotalItemCost,
        subtotalItemSales: acc.subtotalItemSales + r.subtotalItemSales,
        profit: acc.profit + r.profit,
        totalLabourHrs: acc.totalLabourHrs + r.totalLabourHrs,
        totalLabourCost: acc.totalLabourCost + r.totalLabourCost,
      }),
      { subtotalItemCost: 0, subtotalItemSales: 0, profit: 0, totalLabourHrs: 0, totalLabourCost: 0 }
    );
  }, [rows]);

  function patch(src: BudgetSource, p: Partial<BudgetRowOverride>) {
    setOverride(src.id, src.product.id, p);
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900 px-6 py-4 md:px-10">
        <div className="mx-auto flex max-w-full items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              TradeZiller<span className="text-teal-400">Pro</span>
            </h1>
            <p className="mt-0.5 text-sm text-slate-400">
              Project Budget — Grill &amp; Burger Fitout
              {isDemo && (
                <span className="ml-2 rounded-full bg-amber-900/60 px-2 py-0.5 text-xs text-amber-300">
                  Demo data — add takeoffs in the Drawing tool to see live values
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              ← Home
            </Link>
            <Link
              href="/project-overview"
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Project
            </Link>
            <Link
              href="/project"
              className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-400"
            >
              Drawing ↗
            </Link>
          </div>
        </div>
      </div>

      {/* Labour rate control */}
      <div className="mx-auto max-w-full px-6 py-3 md:px-10">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Labour hourly rate:</span>
          <div className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5">
            <span className="text-sm text-slate-400">£</span>
            <input
              type="number"
              min={0}
              step={0.5}
              value={labourHourlyRate}
              onChange={(e) => setLabourHourlyRate(parseFloat(e.target.value) || 0)}
              className="w-16 bg-transparent text-sm text-white focus:outline-none"
            />
            <span className="text-sm text-slate-400">/hr</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 pb-10 md:px-10">
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="min-w-max w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800 text-slate-300">
                {/* Sticky cost-item column */}
                <th className="sticky left-0 z-20 bg-slate-800 px-4 py-3 text-left font-semibold min-w-[200px] border-r border-slate-700">
                  Cost Item
                </th>
                <th className="px-3 py-3 text-left font-semibold min-w-[110px]">Budget Code</th>
                <th className="px-3 py-3 text-right font-semibold min-w-[110px]">Quantity</th>
                <th className="px-3 py-3 text-right font-semibold min-w-[110px]">Unit Cost (£)</th>
                <th className="px-3 py-3 text-right font-semibold min-w-[90px]">Waste (%)</th>
                <th className="px-3 py-3 text-right font-semibold min-w-[160px]">Subtotal Item Cost (£)</th>
                <th className="px-3 py-3 text-right font-semibold min-w-[100px]">Margin (%)</th>
                <th className="px-3 py-3 text-right font-semibold min-w-[120px]">Unit Sales (£)</th>
                <th className="px-3 py-3 text-right font-semibold min-w-[170px]">Subtotal Item Sales (£)</th>
                <th className="px-3 py-3 text-right font-semibold min-w-[110px]">Profit (£)</th>
                <th className="px-3 py-3 text-right font-semibold min-w-[140px]">Unit Labour (mins)</th>
                <th className="px-3 py-3 text-right font-semibold min-w-[140px]">Difficulty Factor</th>
                <th className="px-3 py-3 text-right font-semibold min-w-[140px]">Total Labour (hrs)</th>
                <th className="px-3 py-3 text-right font-semibold min-w-[160px]">Total Labour Cost (£)</th>
                <th className="px-3 py-3 text-left font-semibold min-w-[160px]">Notes</th>
                <th className="px-3 py-3 text-center font-semibold min-w-[80px]">Tax</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const { source, override, qty, unitCost, subtotalItemCost, unitSales, subtotalItemSales, profit, totalLabourHrs, totalLabourCost } = row;
                const { product } = source;
                return (
                  <tr
                    key={source.id}
                    className="border-t border-slate-700/60 hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Sticky cost-item cell */}
                    <td className="sticky left-0 z-10 bg-slate-900 border-r border-slate-700 px-4 py-2 min-w-[200px]">
                      <button
                        type="button"
                        onClick={() => setActiveModal(row)}
                        className="flex items-center gap-2 text-left group"
                      >
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ background: product.colorHex }}
                        />
                        <span className="font-medium text-teal-300 group-hover:underline underline-offset-4 whitespace-nowrap">
                          {product.name}
                        </span>
                      </button>
                      <div className="mt-0.5 pl-5 text-xs text-slate-500">
                        {product.category} · £{product.unitPrice}/{source.unit === "m2" ? "m²" : "m"}
                      </div>
                    </td>

                    {/* Budget code */}
                    <TextCell
                      value={override.budgetCode}
                      placeholder="e.g. FL-001"
                      onChange={(v) => patch(source, { budgetCode: v })}
                    />

                    {/* Quantity (read-only from takeoff) */}
                    <td className={readCell}>
                      {gbp(qty)}&nbsp;{source.unit === "m2" ? "m²" : "m"}
                    </td>

                    {/* Unit cost (from product) */}
                    <td className={readCell}>£{gbp(unitCost)}</td>

                    {/* Waste % */}
                    <NumCell
                      value={override.wastePct}
                      onChange={(v) => patch(source, { wastePct: v })}
                    />

                    {/* Subtotal item cost */}
                    <td className={`${readCell} font-medium text-white`}>
                      £{gbp(subtotalItemCost)}
                    </td>

                    {/* Margin % */}
                    <NumCell
                      value={override.marginPct}
                      onChange={(v) => patch(source, { marginPct: v })}
                    />

                    {/* Unit sales */}
                    <td className={readCell}>£{gbp(unitSales)}</td>

                    {/* Subtotal item sales */}
                    <td className={`${readCell} font-medium text-white`}>
                      £{gbp(subtotalItemSales)}
                    </td>

                    {/* Profit */}
                    <td
                      className={`${readCell} font-medium ${
                        profit >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      £{gbp(profit)}
                    </td>

                    {/* Unit labour (mins) */}
                    <NumCell
                      value={override.unitLabourMins}
                      onChange={(v) => patch(source, { unitLabourMins: v })}
                    />

                    {/* Difficulty factor */}
                    <NumCell
                      value={override.difficultyFactor}
                      onChange={(v) => patch(source, { difficultyFactor: v })}
                    />

                    {/* Total labour hrs */}
                    <td className={readCell}>{num(totalLabourHrs)}</td>

                    {/* Total labour cost */}
                    <td className={readCell}>£{gbp(totalLabourCost)}</td>

                    {/* Notes */}
                    <TextCell
                      value={override.notes}
                      placeholder="Notes…"
                      onChange={(v) => patch(source, { notes: v })}
                    />

                    {/* Tax */}
                    <td className="px-2 py-2 text-center">
                      <select
                        value={override.isTaxable ? "yes" : "no"}
                        onChange={(e) =>
                          patch(source, { isTaxable: e.target.value === "yes" })
                        }
                        className="rounded-full bg-teal-700 px-3 py-1 text-xs font-semibold text-white cursor-pointer border-0 outline-none"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </td>
                  </tr>
                );
              })}

              {/* Totals row */}
              {rows.length > 0 && (
                <tr className="border-t-2 border-slate-600 bg-slate-800/80 font-semibold text-white">
                  <td className="sticky left-0 z-10 bg-slate-800 border-r border-slate-700 px-4 py-3 text-sm">
                    TOTALS
                  </td>
                  <td colSpan={4} />
                  <td className={`${readCell} font-bold text-white`}>
                    £{gbp(totals.subtotalItemCost)}
                  </td>
                  <td />
                  <td />
                  <td className={`${readCell} font-bold text-white`}>
                    £{gbp(totals.subtotalItemSales)}
                  </td>
                  <td
                    className={`${readCell} font-bold ${
                      totals.profit >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    £{gbp(totals.profit)}
                  </td>
                  <td colSpan={2} />
                  <td className={`${readCell} font-bold`}>{num(totals.totalLabourHrs)}</td>
                  <td className={`${readCell} font-bold`}>£{gbp(totals.totalLabourCost)}</td>
                  <td colSpan={2} />
                </tr>
              )}
            </tbody>
          </table>

          {rows.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              No items. Open the{" "}
              <Link href="/project" className="text-teal-400 underline">
                Drawing tool
              </Link>{" "}
              and assign products to your annotations.
            </div>
          )}
        </div>
      </div>

      {activeModal && (
        <RowDetailModal row={activeModal} onClose={() => setActiveModal(null)} />
      )}
    </main>
  );
}
