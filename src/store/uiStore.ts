import { create } from "zustand";

export type ToolType = "pan" | "line" | "polyline" | "area" | "polygon" | "scale";
export type MeasurementSystem = "metric" | "imperial";

interface UiStore {
  activeTool: ToolType;
  activeProductId: string | null;
  measurementSystem: MeasurementSystem;
  isScaleModalOpen: boolean;
  pendingScaleLinePdfUnits: number | null; // stored while modal is open
  /** ID of the annotation to pan to (consumed once by CanvasView) */
  focusAnnotationId: string | null;
  /** ID of the annotation to highlight on the canvas */
  highlightedAnnotationId: string | null;

  setActiveTool: (tool: ToolType) => void;
  setActiveProductId: (id: string | null) => void;
  setMeasurementSystem: (system: MeasurementSystem) => void;
  openScaleModal: (pdfUnits: number) => void;
  closeScaleModal: () => void;
  setFocusAnnotationId: (id: string) => void;
  clearFocusAnnotation: () => void;
  setHighlightedAnnotationId: (id: string | null) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  activeTool: "pan",
  activeProductId: "porcelain-tiles",
  measurementSystem: "metric",
  isScaleModalOpen: false,
  pendingScaleLinePdfUnits: null,
  focusAnnotationId: null,
  highlightedAnnotationId: null,

  setActiveTool: (tool) => set({ activeTool: tool }),
  setActiveProductId: (id) => set({ activeProductId: id }),
  setMeasurementSystem: (system) => set({ measurementSystem: system }),
  openScaleModal: (pdfUnits) =>
    set({ isScaleModalOpen: true, pendingScaleLinePdfUnits: pdfUnits }),
  closeScaleModal: () =>
    set({ isScaleModalOpen: false, pendingScaleLinePdfUnits: null }),
  setFocusAnnotationId: (id) => set({ focusAnnotationId: id }),
  clearFocusAnnotation: () => set({ focusAnnotationId: null }),
  setHighlightedAnnotationId: (id) => set({ highlightedAnnotationId: id }),
}));
