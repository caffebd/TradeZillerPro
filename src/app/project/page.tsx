"use client";
import dynamic from "next/dynamic";
import { useState, useCallback, useRef } from "react";
import Toolbar from "@/components/Toolbar";
import LeftPanel from "@/components/LeftPanel";

// Load CanvasView client-side only — PixiJS and PDF.js require browser APIs
const CanvasView = dynamic(() => import("@/components/CanvasView"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-slate-800">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-sm">Loading drawing…</p>
      </div>
    </div>
  ),
});

export default function ProjectPage() {
  const [zoom, setZoom] = useState(1);

  // Imperative refs to hold the handlers registered by CanvasView
  const fitPageRef = useRef<(() => void) | null>(null);
  const zoomInRef = useRef<(() => void) | null>(null);
  const zoomOutRef = useRef<(() => void) | null>(null);

  const handleFitPage = useCallback(() => fitPageRef.current?.(), []);
  const handleZoomIn = useCallback(() => zoomInRef.current?.(), []);
  const handleZoomOut = useCallback(() => zoomOutRef.current?.(), []);

  return (
    <div className="flex flex-col h-screen bg-slate-900 overflow-hidden">
      <Toolbar
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitPage={handleFitPage}
      />
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel />
        <CanvasView
          onCameraChange={setZoom}
          onFitPage={(fn) => { fitPageRef.current = fn; }}
          onZoomIn={(fn) => { zoomInRef.current = fn; }}
          onZoomOut={(fn) => { zoomOutRef.current = fn; }}
        />
      </div>
    </div>
  );
}
