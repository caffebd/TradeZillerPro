"use client";
import {
  MousePointer2,
  Minus,
  GitCommitHorizontal,
  Square,
  Ruler,
  Undo2,
  Redo2,
} from "lucide-react";
import { useUiStore, type ToolType } from "@/store/uiStore";
import { useAnnotationStore } from "@/store/annotationStore";
import { DRAWINGS } from "@/data/drawings";

const TOOLS: { id: ToolType; label: string; icon: React.ReactNode }[] = [
  { id: "pan", label: "Pan (Space)", icon: <MousePointer2 size={18} /> },
  { id: "line", label: "Line", icon: <Minus size={18} /> },
  { id: "polyline", label: "Polyline", icon: <GitCommitHorizontal size={18} /> },
  { id: "area", label: "Area", icon: <Square size={18} /> },
  { id: "scale", label: "Set Scale", icon: <Ruler size={18} /> },
];

interface ToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitPage: () => void;
}

export default function Toolbar({ zoom, onZoomIn, onZoomOut, onFitPage }: ToolbarProps) {
  const activeTool = useUiStore((s) => s.activeTool);
  const setActiveTool = useUiStore((s) => s.setActiveTool);
  const activeDrawingId = useAnnotationStore((s) => s.activeDrawingId);
  const setActiveDrawing = useAnnotationStore((s) => s.setActiveDrawing);
  const scaleCalibration = useAnnotationStore((s) => s.scaleCalibration);
  const undo = useAnnotationStore((s) => s.undo);
  const redo = useAnnotationStore((s) => s.redo);
  const canUndo = useAnnotationStore((s) => s.canUndo)();
  const canRedo = useAnnotationStore((s) => s.canRedo)();

  return (
    <header className="flex items-center gap-1 h-12 bg-slate-900 border-b border-slate-700 px-3 select-none shrink-0">
      {/* Logo */}
      <div className="text-white font-bold text-base mr-4 tracking-tight">
        TradeZiller<span className="text-teal-400">Pro</span>
      </div>

      <select
        value={activeDrawingId}
        onChange={(e) => setActiveDrawing(e.target.value as (typeof activeDrawingId))}
        className="h-9 rounded-lg bg-slate-800 border border-slate-700 px-3 text-sm text-slate-100 outline-none hover:border-slate-500 focus:border-teal-400 mr-2"
        aria-label="Select drawing"
      >
        {DRAWINGS.map((drawing) => (
          <option key={drawing.id} value={drawing.id}>
            {drawing.label}
          </option>
        ))}
      </select>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-700 mr-2" />

      {/* Tools */}
      {TOOLS.map((t) => (
        <button
          key={t.id}
          title={t.label}
          onClick={() => setActiveTool(t.id)}
          className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors text-sm
            ${
              activeTool === t.id
                ? "bg-teal-500 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
        >
          {t.icon}
        </button>
      ))}

      {/* Divider */}
      <div className="w-px h-6 bg-slate-700 mx-1" />

      {/* Undo / Redo */}
      <button
        title="Undo (Ctrl+Z)"
        onClick={undo}
        disabled={!canUndo}
        className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Undo2 size={18} />
      </button>
      <button
        title="Redo (Ctrl+Y)"
        onClick={redo}
        disabled={!canRedo}
        className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Redo2 size={18} />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Scale status */}
      {scaleCalibration ? (
        <span className="text-xs text-teal-400 font-mono mr-3">
          1m = {scaleCalibration.pdfUnitsPerMetre.toFixed(1)} pts
        </span>
      ) : (
        <span className="text-xs text-amber-400 mr-3">Scale not set</span>
      )}

      {/* Zoom controls */}
      <button
        onClick={onZoomOut}
        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors text-lg font-bold"
        title="Zoom out"
      >
        −
      </button>
      <button
        onClick={onFitPage}
        className="text-xs font-mono text-slate-300 hover:text-white w-14 text-center hover:bg-slate-700 rounded py-1 transition-colors"
        title="Fit page"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        onClick={onZoomIn}
        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors text-lg font-bold"
        title="Zoom in"
      >
        +
      </button>
    </header>
  );
}
