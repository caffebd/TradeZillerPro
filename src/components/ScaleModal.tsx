"use client";
import { useState } from "react";
import { useUiStore } from "@/store/uiStore";

interface ScaleModalProps {
  onConfirm: (pdfUnitsPerMetre: number) => void;
  onCancel: () => void;
}

export default function ScaleModal({ onConfirm, onCancel }: ScaleModalProps) {
  const pendingPdfUnits = useUiStore((s) => s.pendingScaleLinePdfUnits);
  const [realWorld, setRealWorld] = useState("");
  const [unit, setUnit] = useState<"mm" | "m" | "ft">("m");

  function handleConfirm() {
    const value = parseFloat(realWorld);
    if (!value || value <= 0 || !pendingPdfUnits) return;

    let metres: number;
    if (unit === "mm") metres = value / 1000;
    else if (unit === "ft") metres = value * 0.3048;
    else metres = value;

    const pdfUnitsPerMetre = pendingPdfUnits / metres;
    onConfirm(pdfUnitsPerMetre);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-6 w-96">
        <h2 className="text-white font-semibold text-lg mb-1">Set Scale</h2>
        <p className="text-slate-400 text-sm mb-4">
          You drew a line of{" "}
          <span className="text-teal-400 font-mono">
            {pendingPdfUnits?.toFixed(1)} PDF units
          </span>
          . Enter its real-world length to calibrate measurements.
        </p>

        <label className="text-slate-300 text-sm block mb-1">
          Real-world length
        </label>
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            min="0"
            step="any"
            value={realWorld}
            onChange={(e) => setRealWorld(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            placeholder="e.g. 8.85"
            className="flex-1 bg-slate-700 border border-slate-500 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            autoFocus
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as "mm" | "m" | "ft")}
            className="bg-slate-700 border border-slate-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
          >
            <option value="mm">mm</option>
            <option value="m">m</option>
            <option value="ft">ft</option>
          </select>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!realWorld || parseFloat(realWorld) <= 0}
            className="px-5 py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Set Scale
          </button>
        </div>
      </div>
    </div>
  );
}
