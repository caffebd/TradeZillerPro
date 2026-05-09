import { create } from "zustand";

export type ToolType = "pan" | "line" | "polyline" | "area" | "polygon" | "scale";
export type MeasurementSystem = "metric" | "imperial";

interface UiStore {
  activeTool: ToolType;
  activeProductId: string | null;
  measurementSystem: MeasurementSystem;
  isScaleModalOpen: boolean;
  pendingScaleLinePdfUnits: number | null; // stored while modal is open

  setActiveTool: (tool: ToolType) => void;
  setActiveProductId: (id: string | null) => void;
  setMeasurementSystem: (system: MeasurementSystem) => void;
  openScaleModal: (pdfUnits: number) => void;
  closeScaleModal: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  activeTool: "pan",
  activeProductId: "porcelain-tiles",
  measurementSystem: "metric",
  isScaleModalOpen: false,
  pendingScaleLinePdfUnits: null,

  setActiveTool: (tool) => set({ activeTool: tool }),
  setActiveProductId: (id) => set({ activeProductId: id }),
  setMeasurementSystem: (system) => set({ measurementSystem: system }),
  openScaleModal: (pdfUnits) =>
    set({ isScaleModalOpen: true, pendingScaleLinePdfUnits: pdfUnits }),
  closeScaleModal: () =>
    set({ isScaleModalOpen: false, pendingScaleLinePdfUnits: null }),
}));
