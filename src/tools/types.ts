import type { PdfPoint } from "@/types/annotation";
import type { MeasurementSystem } from "@/store/uiStore";

export interface ToolCallbacks {
  /** Add a completed annotation */
  commitAnnotation: (ann: import("@/types/annotation").Annotation) => void;
  /** Replace the in-progress drawing layer graphics */
  updatePreview: (draw: (g: import("pixi.js").Graphics) => void) => void;
  clearPreview: () => void;
  openScaleModal: (pdfUnits: number) => void;
  getActiveProductId: () => string | null;
  getScaleCalibration: () => import("@/types/scale").ScaleCalibration | null;
  /** Current camera scale — use to keep dot radii constant in screen pixels */
  getCameraScale: () => number;
  getMeasurementSystem: () => MeasurementSystem;
  setPreviewMeasurement: (args: { text: string; x: number; y: number } | null) => void;
}

export interface Tool {
  name: string;
  onPointerDown?: (pt: PdfPoint, callbacks: ToolCallbacks) => void;
  onPointerMove?: (pt: PdfPoint, callbacks: ToolCallbacks) => void;
  onPointerUp?: (pt: PdfPoint, callbacks: ToolCallbacks) => void;
  onDoubleClick?: (pt: PdfPoint, callbacks: ToolCallbacks) => void;
  /** Called when the tool is deactivated — clean up in-progress state */
  onDeactivate?: (callbacks: ToolCallbacks) => void;
}
