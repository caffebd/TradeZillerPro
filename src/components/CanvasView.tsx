"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { Graphics } from "pixi.js";
import { initPixiApp, destroyPixiApp, applyCameraTransform } from "@/engine/PixiApp";
import { getLayers } from "@/engine/PixiApp";
import { loadPdf } from "@/engine/pdfRenderer";
import { TileManager } from "@/engine/tileManager";
import { renderAnnotations } from "@/engine/annotationRenderer";
import { useCameraStore } from "@/store/cameraStore";
import { useAnnotationStore } from "@/store/annotationStore";
import { useUiStore } from "@/store/uiStore";
import { DRAWINGS } from "@/data/drawings";
import { panCamera, zoomCamera, screenToPdf } from "@/types/camera";
import type { PdfPoint } from "@/types/annotation";
import { panTool } from "@/tools/panTool";
import { lineTool } from "@/tools/lineTool";
import { polylineTool } from "@/tools/polylineTool";
import { areaTool } from "@/tools/areaTool";
import { scaleTool } from "@/tools/scaleTool";
import type { Tool } from "@/tools/types";
import ScaleModal from "./ScaleModal";
import StatusBar from "./StatusBar";

const TOOLS: Record<string, Tool> = {
  pan: panTool,
  line: lineTool,
  polyline: polylineTool,
  area: areaTool,
  scale: scaleTool,
};

interface CanvasViewProps {
  onCameraChange?: (zoom: number) => void;
  onFitPage?: (handler: () => void) => void;
  onZoomIn?: (handler: () => void) => void;
  onZoomOut?: (handler: () => void) => void;
}

export default function CanvasView({
  onCameraChange,
  onFitPage,
  onZoomIn,
  onZoomOut,
}: CanvasViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tileManagerRef = useRef<TileManager | null>(null);
  const drawingGfxRef = useRef<Graphics | null>(null);
  const isPanningRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const pageDimsRef = useRef({ width: 0, height: 0 });
  const isInitialised = useRef(false);
  const [cursorPdf, setCursorPdf] = useState<PdfPoint | null>(null);
  const [isDrawingLoading, setIsDrawingLoading] = useState(false);

  const camera = useCameraStore((s) => s.camera);
  const updateCamera = useCameraStore((s) => s.updateCamera);
  const setCamera = useCameraStore((s) => s.setCamera);
  const activeDrawingId = useAnnotationStore((s) => s.activeDrawingId);
  const annotations = useAnnotationStore((s) => s.annotations);
  const addAnnotation = useAnnotationStore((s) => s.addAnnotation);
  const scaleCalibration = useAnnotationStore((s) => s.scaleCalibration);
  const setScaleCalibration = useAnnotationStore((s) => s.setScaleCalibration);
  const activeTool = useUiStore((s) => s.activeTool);
  const activeProductId = useUiStore((s) => s.activeProductId);
  const isScaleModalOpen = useUiStore((s) => s.isScaleModalOpen);
  const openScaleModal = useUiStore((s) => s.openScaleModal);
  const closeScaleModal = useUiStore((s) => s.closeScaleModal);

  const activeDrawing = DRAWINGS.find((drawing) => drawing.id === activeDrawingId) ?? DRAWINGS[0];

  // Fit the page in the viewport
  const fitPage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pageDimsRef.current.width) return;
    const vw = canvas.clientWidth;
    const vh = canvas.clientHeight;
    const { width: pw, height: ph } = pageDimsRef.current;
    const scale = Math.min(vw / pw, vh / ph) * 0.92;
    setCamera({
      scale,
      originX: (pw - vw / scale) / 2,
      originY: (ph - vh / scale) / 2,
    });
  }, [setCamera]);

  // Register imperative handlers for Toolbar buttons
  useEffect(() => {
    onFitPage?.(fitPage);
    onZoomIn?.(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      updateCamera((c) => zoomCamera(c, canvas.clientWidth / 2, canvas.clientHeight / 2, 1));
    });
    onZoomOut?.(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      updateCamera((c) => zoomCamera(c, canvas.clientWidth / 2, canvas.clientHeight / 2, -1));
    });
  }, [fitPage, onFitPage, onZoomIn, onZoomOut, updateCamera]);

  // Initialise PixiJS + PDF on mount
  useEffect(() => {
    if (isInitialised.current) return;
    isInitialised.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;

    (async () => {
      try {
        const { layers } = await initPixiApp(canvas);

        // Drawing layer graphics
        const dGfx = new Graphics();
        layers.drawingLayer.addChild(dGfx);
        drawingGfxRef.current = dGfx;

        setCamera({
          scale: 1,
          originX: 0,
          originY: 0,
        });
      } catch (err) {
        console.error("PixiJS/PDF init error:", err);
      }
    })();

    return () => {
      tileManagerRef.current?.destroy();
      destroyPixiApp();
      isInitialised.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load the active drawing's PDF and rebuild the tile manager.
  useEffect(() => {
    const canvas = canvasRef.current;
    const tileManager = tileManagerRef.current;
    const pixiLayers = getLayers();
    if (!canvas || !pixiLayers || !isInitialised.current) return;

    let cancelled = false;

    (async () => {
      try {
        setIsDrawingLoading(true);
        const pdfDoc = await loadPdf(activeDrawing.pdfUrl);
        if (cancelled) return;

        const page = await pdfDoc.getPage(1);
        if (cancelled) return;

        const vp = page.getViewport({ scale: 1 });
        pageDimsRef.current = { width: vp.width, height: vp.height };

        tileManager?.destroy();
        const pageMap = new Map([[0, page]]);
        const nextTileManager = new TileManager(pixiLayers.pdfLayer, pageMap);
        tileManagerRef.current = nextTileManager;

        const vw = canvas.clientWidth;
        const vh = canvas.clientHeight;
        const { width: pw, height: ph } = pageDimsRef.current;
        const initialScale = Math.min(vw / pw, vh / ph) * 0.92;
        setCamera({
          scale: initialScale,
          originX: (pw - vw / initialScale) / 2,
          originY: (ph - vh / initialScale) / 2,
        });
      } catch (err) {
        console.error(`Failed to load drawing ${activeDrawing.label}:`, err);
      } finally {
        if (!cancelled) setIsDrawingLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeDrawing, setCamera]);

  // Camera/annotation/calibration effect:
  // 1. Apply camera as a container transform (GPU-side, instant, no per-sprite JS)
  // 2. Tell tileManager which tiles to load next
  // 3. Re-draw annotation graphics in PDF space
  useEffect(() => {
    const canvas = canvasRef.current;
    const tileManager = tileManagerRef.current;
    if (!canvas || !tileManager) return;

    const { getLayers } = require("@/engine/PixiApp");
    const layers = getLayers();
    if (layers) {
      // All three layers live in PDF space — one transform drives all of them.
      applyCameraTransform(layers.pdfLayer, camera);
      applyCameraTransform(layers.annotationLayer, camera);
      applyCameraTransform(layers.drawingLayer, camera);
    }

    tileManager.updateViewport(camera, canvas.clientWidth, canvas.clientHeight);
    onCameraChange?.(camera.scale);

    if (layers) {
      renderAnnotations(
        layers.annotationLayer,
        annotations,
        camera,
        scaleCalibration
      );
    }
  }, [camera, annotations, scaleCalibration, onCameraChange]);

  // Tool callbacks
  const toolCallbacks = {
    commitAnnotation: addAnnotation,
    updatePreview: (draw: (g: Graphics) => void) => {
      const gfx = drawingGfxRef.current;
      if (!gfx) return;
      // drawingLayer now lives in PDF space (applyCameraTransform is applied).
      // Tools already pass PDF coordinates — draw directly, no proxy needed.
      gfx.clear();
      draw(gfx);
    },
    clearPreview: () => {
      drawingGfxRef.current?.clear();
    },
    openScaleModal,
    getActiveProductId: () => useUiStore.getState().activeProductId,
    getScaleCalibration: () => useAnnotationStore.getState().scaleCalibration,
    getCameraScale: () => useCameraStore.getState().camera.scale,
  };

  // Pointer handlers
  const getEventPdfPoint = useCallback(
    (e: React.PointerEvent): PdfPoint => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      return screenToPdf(sx, sy, useCameraStore.getState().camera);
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const tool = activeTool;
      if (tool === "pan") {
        isPanningRef.current = true;
        lastPointerRef.current = { x: e.clientX, y: e.clientY };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        return;
      }
      const pt = getEventPdfPoint(e);
      TOOLS[tool]?.onPointerDown?.(pt, toolCallbacks);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTool, getEventPdfPoint]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const cam = useCameraStore.getState().camera;
      const pdf = screenToPdf(sx, sy, cam);
      setCursorPdf(pdf);

      if (isPanningRef.current) {
        const dx = e.clientX - lastPointerRef.current.x;
        const dy = e.clientY - lastPointerRef.current.y;
        lastPointerRef.current = { x: e.clientX, y: e.clientY };
        updateCamera((c) => panCamera(c, dx, dy));
        return;
      }

      const tool = activeTool;
      if (tool !== "pan") {
        const pt = getEventPdfPoint(e);
        TOOLS[tool]?.onPointerMove?.(pt, toolCallbacks);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTool, updateCamera, getEventPdfPoint]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        return;
      }
      const tool = activeTool;
      const pt = getEventPdfPoint(e);
      TOOLS[tool]?.onPointerUp?.(pt, toolCallbacks);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTool, getEventPdfPoint]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const cam = useCameraStore.getState().camera;
      const pt = screenToPdf(sx, sy, cam);
      const tool = activeTool;
      TOOLS[tool]?.onDoubleClick?.(pt, toolCallbacks);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTool]
  );

  // Wheel zoom — must be a non-passive imperative listener so preventDefault()
  // actually works. React's synthetic onWheel is passive by default, which means
  // the browser ignores preventDefault() and also scrolls the page, shifting
  // getBoundingClientRect() between ticks and causing erratic zoom-center jumps.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      useCameraStore.getState().updateCamera((c) =>
        zoomCamera(c, sx, sy, e.deltaY < 0 ? 1 : -1)
      );
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const setActiveTool = useUiStore.getState().setActiveTool;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.code === "Space") setActiveTool("pan");
      if (e.code === "KeyL") setActiveTool("line");
      if (e.code === "KeyP") setActiveTool("polyline");
      if (e.code === "KeyA") setActiveTool("area");
      if (e.code === "KeyS") setActiveTool("scale");
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ") {
        useAnnotationStore.getState().undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.code === "KeyY" || (e.shiftKey && e.code === "KeyZ"))) {
        useAnnotationStore.getState().redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Deactivate tool on change
  const prevToolRef = useRef(activeTool);
  useEffect(() => {
    if (prevToolRef.current !== activeTool) {
      TOOLS[prevToolRef.current]?.onDeactivate?.(toolCallbacks);
      prevToolRef.current = activeTool;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool]);

  return (
    <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden relative">
      <canvas
        ref={canvasRef}
        className="flex-1 block w-full h-full"
        style={{ cursor: activeTool === "pan" ? "grab" : "crosshair", touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      />
      <StatusBar cursorPdf={cursorPdf} />

      {isDrawingLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30 pointer-events-none">
          <div className="rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-slate-300 shadow-xl">
            Loading {activeDrawing.label}...
          </div>
        </div>
      )}

      {isScaleModalOpen && (
        <ScaleModal
          onConfirm={(pdfUnitsPerMetre) => {
            setScaleCalibration({ pdfUnitsPerMetre, pageIndex: 0 });
            closeScaleModal();
          }}
          onCancel={closeScaleModal}
        />
      )}
    </div>
  );
}
