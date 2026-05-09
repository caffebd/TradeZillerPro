import { create } from "zustand";

export type ToolType = "pan" | "line" | "polyline" | "area" | "scale";

interface UiStore {
  activeTool: ToolType;
  activeProductId: string | null;
  isScaleModalOpen: boolean;
  pendingScaleLinePdfUnits: number | null; // stored while modal is open

  setActiveTool: (tool: ToolType) => void;
  setActiveProductId: (id: string | null) => void;
  openScaleModal: (pdfUnits: number) => void;
  closeScaleModal: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  activeTool: "pan",
  activeProductId: "porcelain-tiles",
  isScaleModalOpen: false,
  pendingScaleLinePdfUnits: null,

  setActiveTool: (tool) => set({ activeTool: tool }),
  setActiveProductId: (id) => set({ activeProductId: id }),
  openScaleModal: (pdfUnits) =>
    set({ isScaleModalOpen: true, pendingScaleLinePdfUnits: pdfUnits }),
  closeScaleModal: () =>
    set({ isScaleModalOpen: false, pendingScaleLinePdfUnits: null }),
}));
