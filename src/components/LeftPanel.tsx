"use client";
import { useMemo, useState } from "react";
import { PRODUCTS } from "@/data/products";
import { useUiStore } from "@/store/uiStore";
import { useAnnotationStore } from "@/store/annotationStore";
import { useProductStore } from "@/store/productStore";
import type { TakeoffLine } from "@/store/productStore";
import { Layers, ListOrdered, ChevronDown, ChevronUp } from "lucide-react";
import { m2ToFt2, metresToFeet } from "@/types/scale";

export default function LeftPanel() {
  const [tab, setTab] = useState<"products" | "takeoffs">("products");
  const [collapsed, setCollapsed] = useState(false);

  const activeProductId = useUiStore((s) => s.activeProductId);
  const setActiveProductId = useUiStore((s) => s.setActiveProductId);
  const measurementSystem = useUiStore((s) => s.measurementSystem);
  const calibration = useAnnotationStore((s) => s.scaleCalibration);
  const annotations = useAnnotationStore((s) => s.annotations);
  const getTakeoffs = useProductStore((s) => s.getTakeoffs);

  const takeoffs: TakeoffLine[] = getTakeoffs(annotations, calibration);

  const totalCost = takeoffs.reduce((s, t) => s + t.cost, 0);

  // Grouped view: one entry per product, summed measurement + cost
  const grouped = useMemo(() => {
    const map = new Map<string, { line: TakeoffLine; totalMeasurement: number; totalCost: number; count: number }>();
    for (const t of takeoffs) {
      const pid = t.product.id;
      const existing = map.get(pid);
      if (existing) {
        existing.totalMeasurement += t.measurement;
        existing.totalCost += t.cost;
        existing.count++;
      } else {
        map.set(pid, { line: t, totalMeasurement: t.measurement, totalCost: t.cost, count: 1 });
      }
    }
    return Array.from(map.values());
  }, [takeoffs]);

  function formatMeasurement(measurement: number, unit: "m2" | "m") {
    if (!calibration) return `${measurement.toFixed(0)} pts (no scale)`;
    if (measurementSystem === "imperial") {
      const val = unit === "m2" ? m2ToFt2(measurement) : metresToFeet(measurement);
      return `${val.toFixed(2)} ${unit === "m2" ? "ft²" : "ft"}`;
    }
    return `${measurement.toFixed(2)} ${unit === "m2" ? "m²" : "m"}`;
  }

  function focusAnnotation(id: string) {
    useUiStore.getState().setFocusAnnotationId(id);
  }

  return (
    <aside className="w-72 bg-slate-800 border-r border-slate-700 flex flex-col shrink-0 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setTab("products")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors
            ${tab === "products" ? "text-teal-400 border-b-2 border-teal-400" : "text-slate-400 hover:text-white"}`}
        >
          <Layers size={14} /> Products
        </button>
        <button
          onClick={() => setTab("takeoffs")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors
            ${tab === "takeoffs" ? "text-teal-400 border-b-2 border-teal-400" : "text-slate-400 hover:text-white"}`}
        >
          <ListOrdered size={14} /> Takeoffs ({takeoffs.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "products" && (
          <div className="p-3 space-y-1">
            {Array.from(new Set(PRODUCTS.map((p) => p.category))).map((cat) => (
              <div key={cat}>
                <div className="text-xs text-slate-500 uppercase tracking-wider px-2 py-1 mt-2">
                  {cat}
                </div>
                {PRODUCTS.filter((p) => p.category === cat).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveProductId(p.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
                      ${
                        activeProductId === p.id
                          ? "bg-slate-700 ring-1 ring-teal-500"
                          : "hover:bg-slate-700/60"
                      }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: p.colorHex }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-100 truncate">{p.name}</div>
                      <div className="text-xs text-slate-400">
                        {measurementSystem === "imperial"
                          ? `£${(p.unit === "m2" ? p.unitPrice / 10.7639 : p.unitPrice / 3.28084).toFixed(2)}/${p.unit === "m2" ? "ft²" : "ft"}`
                          : `£${p.unitPrice}/${p.unit === "m2" ? "m²" : "m"}`}
                      </div>
                    </div>
                    {activeProductId === p.id && (
                      <span className="text-teal-400 text-xs font-bold">●</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        {tab === "takeoffs" && (
          <div className="flex flex-col h-full">
            {takeoffs.length === 0 && (
              <p className="text-slate-500 text-sm text-center mt-8 px-4">
                Draw measurements on the plan to see takeoffs here.
              </p>
            )}

            {takeoffs.length > 0 && (
              <>
                {/* Collapse toggle */}
                <div className="flex items-center justify-between px-3 pt-3 pb-1">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">
                    {collapsed ? `${grouped.length} product${grouped.length !== 1 ? "s" : ""}` : `${takeoffs.length} item${takeoffs.length !== 1 ? "s" : ""}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCollapsed((c) => !c)}
                    className="flex items-center gap-1 rounded-md bg-slate-700 px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-600 transition-colors"
                    title={collapsed ? "Expand to show individual items" : "Collapse to grouped totals"}
                  >
                    {collapsed ? <><ChevronDown size={12} /> Expand</> : <><ChevronUp size={12} /> Collapse</>}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
                  {collapsed ? (
                    /* ── Grouped / collapsed view ── */
                    grouped.map(({ line: t, totalMeasurement, totalCost: tCost, count }) => (
                      <div
                        key={t.product.id}
                        className="bg-slate-700/50 rounded-lg p-3 border border-slate-600"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: t.product.colorHex }}
                          />
                          <span className="text-sm text-slate-100 font-medium truncate flex-1">
                            {t.product.name}
                          </span>
                          <span className="text-xs text-slate-500 shrink-0">{count}×</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>{formatMeasurement(totalMeasurement, t.unit)}</span>
                          <span className="text-white font-semibold">
                            {calibration ? `£${tCost.toFixed(2)}` : "—"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    /* ── Expanded / individual view ── */
                    takeoffs.map((t, idx) => (
                      <button
                        key={t.annotation.id}
                        type="button"
                        onClick={() => focusAnnotation(t.annotation.id)}
                        className="w-full bg-slate-700/50 rounded-lg p-3 border border-slate-600 text-left hover:border-teal-500 hover:bg-slate-700 transition-colors group"
                        title="Click to pan to this annotation and highlight it"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-slate-500 w-5 shrink-0">
                            #{idx + 1}
                          </span>
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: t.product.colorHex }}
                          />
                          <span className="text-sm text-slate-100 font-medium truncate flex-1 group-hover:text-teal-300 transition-colors">
                            {t.product.name}
                          </span>
                          <span className="text-xs text-slate-500 shrink-0 capitalize">
                            {t.annotation.type}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 pl-7">
                          <span>{formatMeasurement(t.measurement, t.unit)}</span>
                          <span className="text-white font-semibold">
                            {calibration ? `£${t.cost.toFixed(2)}` : "—"}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Cost summary footer */}
      {tab === "takeoffs" && takeoffs.length > 0 && (
        <div className="border-t border-slate-700 p-4 bg-slate-800">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 text-sm">Total Estimate</span>
            <span className="text-white text-lg font-bold">
              {calibration ? `£${totalCost.toFixed(2)}` : "Set scale first"}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
