"use client";
import { useState } from "react";
import { PRODUCTS } from "@/data/products";
import { useUiStore } from "@/store/uiStore";
import { useAnnotationStore } from "@/store/annotationStore";
import { useProductStore } from "@/store/productStore";
import type { TakeoffLine } from "@/store/productStore";
import { Layers, ListOrdered } from "lucide-react";

export default function LeftPanel() {
  const [tab, setTab] = useState<"products" | "takeoffs">("products");
  const activeProductId = useUiStore((s) => s.activeProductId);
  const setActiveProductId = useUiStore((s) => s.setActiveProductId);
  const calibration = useUiStore((s) => s.scaleCalibration);
  const annotations = useAnnotationStore((s) => s.annotations);
  const getTakeoffs = useProductStore((s) => s.getTakeoffs);

  const takeoffs: TakeoffLine[] = getTakeoffs(annotations, calibration);

  const totalCost = takeoffs.reduce((s, t) => s + t.cost, 0);

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
            {/* Group by category */}
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
                        £{p.unitPrice}/{p.unit === "m2" ? "m²" : "m"}
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
          <div className="p-3 space-y-2">
            {takeoffs.length === 0 && (
              <p className="text-slate-500 text-sm text-center mt-8 px-4">
                Draw measurements on the plan to see takeoffs here.
              </p>
            )}
            {takeoffs.map((t) => (
              <div
                key={t.annotation.id}
                className="bg-slate-700/50 rounded-lg p-3 border border-slate-600"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: t.product.colorHex }}
                  />
                  <span className="text-sm text-slate-100 font-medium truncate">
                    {t.product.name}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>
                    {calibration
                      ? `${t.measurement.toFixed(2)} ${t.unit === "m2" ? "m²" : "m"}`
                      : `${t.measurement.toFixed(0)} pts (no scale)`}
                  </span>
                  <span className="text-white font-semibold">
                    {calibration ? `£${t.cost.toFixed(2)}` : "—"}
                  </span>
                </div>
              </div>
            ))}
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
