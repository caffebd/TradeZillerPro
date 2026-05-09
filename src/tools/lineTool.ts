import { Graphics } from "pixi.js";
import type { PdfPoint } from "@/types/annotation";
import type { Tool, ToolCallbacks } from "./types";
import { PRODUCTS_MAP } from "@/data/products";
import { pointDistance } from "@/types/annotation";
import { metresToFeet, pdfLengthToMetres } from "@/types/scale";

let startPt: PdfPoint | null = null;
let isDragging = false;

export const lineTool: Tool = {
  name: "line",

  onPointerDown(pt, cb) {
    startPt = pt;
    isDragging = true;
    cb.setPreviewMeasurement(null);
  },

  onPointerMove(pt, cb) {
    if (!isDragging || !startPt) return;
    const productId = cb.getActiveProductId();
    const color = productId ? (PRODUCTS_MAP.get(productId)?.color ?? 0x14b8a6) : 0x14b8a6;
    const s = { ...startPt! };
    const e = { ...pt };
    cb.updatePreview((g: Graphics) => {
      g.clear();
      g.setStrokeStyle({ color, width: 2, alpha: 1 });
      g.moveTo(s.x, s.y);
      g.lineTo(e.x, e.y);
      g.stroke();
    });

    const midX = (s.x + e.x) / 2;
    const midY = (s.y + e.y) / 2;
    const pdfLen = pointDistance(s, e);
    const cal = cb.getScaleCalibration();
    const system = cb.getMeasurementSystem();

    let text = `${pdfLen.toFixed(1)} pts`;
    if (cal) {
      const m = pdfLengthToMetres(pdfLen, cal);
      text = system === "imperial" ? `${metresToFeet(m).toFixed(2)} ft` : `${m.toFixed(2)} m`;
    }

    cb.setPreviewMeasurement({ text, x: midX, y: midY });
  },

  onPointerUp(pt, cb) {
    if (!startPt) return;
    const productId = cb.getActiveProductId();
    const color = productId ? (PRODUCTS_MAP.get(productId)?.color ?? 0x14b8a6) : 0x14b8a6;

    cb.commitAnnotation({
      type: "line",
      id: crypto.randomUUID(),
      pageIndex: 0,
      productId,
      start: startPt,
      end: pt,
      style: { color, alpha: 1, width: 2 },
    });

    cb.clearPreview();
    cb.setPreviewMeasurement(null);
    startPt = null;
    isDragging = false;
  },

  onDeactivate(cb) {
    cb.clearPreview();
    cb.setPreviewMeasurement(null);
    startPt = null;
    isDragging = false;
  },
};
