"use client";
import type { PdfPoint } from "@/types/annotation";
import { useUiStore } from "@/store/uiStore";
import { useAnnotationStore } from "@/store/annotationStore";

interface StatusBarProps {
  cursorPdf: PdfPoint | null;
}

export default function StatusBar({ cursorPdf }: StatusBarProps) {
  const calibration = useAnnotationStore((s) => s.scaleCalibration);
  const activeTool = useUiStore((s) => s.activeTool);

  const toolHints: Record<string, string> = {
    pan: "Drag to pan · Scroll to zoom",
    line: "Click start point · Click end point",
    polyline: "Click to add points · Double-click to finish",
    area: "Click and drag to draw rectangle",
    polygon: "Click to add vertices · Click first point to close",
    scale: "Draw a line over a known dimension then enter its real length",
  };

  return (
    <footer className="flex items-center gap-4 h-7 bg-slate-900 border-t border-slate-700 px-4 text-xs text-slate-500 shrink-0">
      {cursorPdf && (
        <span className="font-mono">
          x: {cursorPdf.x.toFixed(1)}  y: {cursorPdf.y.toFixed(1)} pts
        </span>
      )}
      <span className="text-slate-600">|</span>
      <span>{toolHints[activeTool] ?? ""}</span>
      <div className="flex-1" />
      {!calibration && (
        <span className="text-amber-500">
          ⚠ Scale not calibrated — select the Scale tool to set it
        </span>
      )}
    </footer>
  );
}
