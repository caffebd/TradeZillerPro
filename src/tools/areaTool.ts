import { Graphics } from "pixi.js";
import type { PdfPoint } from "@/types/annotation";
import type { Tool, ToolCallbacks } from "./types";
import { PRODUCTS_MAP } from "@/data/products";
import { m2ToFt2, pdfAreaToM2 } from "@/types/scale";

let startPt: PdfPoint | null = null;
let isDragging = false;

function rectanglePoints(start: PdfPoint, end: PdfPoint): PdfPoint[] {
  return [
    { x: start.x, y: start.y },
    { x: end.x, y: start.y },
    { x: end.x, y: end.y },
    { x: start.x, y: end.y },
  ];
}

function drawAreaPreview(start: PdfPoint, end: PdfPoint, g: Graphics, color: number) {
  g.clear();
  const pts = rectanglePoints(start, end);
  g.poly(pts).fill({ color, alpha: 0.2 });

  // Outline
  g.setStrokeStyle({ color, width: 2, alpha: 0.9 });
  g.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    g.lineTo(pts[i].x, pts[i].y);
  }
  g.lineTo(pts[0].x, pts[0].y);
  g.stroke();
}

export const areaTool: Tool = {
  name: "area",

  onPointerDown(pt, cb) {
    startPt = pt;
    isDragging = true;
    cb.setPreviewMeasurement(null);
  },

  onPointerMove(pt, cb) {
    if (!isDragging || !startPt) return;
    const productId = cb.getActiveProductId();
    const color = productId ? (PRODUCTS_MAP.get(productId)?.color ?? 0x14b8a6) : 0x14b8a6;
    const s = { ...startPt };
    const e = { ...pt };
    cb.updatePreview((g: Graphics) => drawAreaPreview(s, e, g, color));

    const areaPdf = Math.abs((e.x - s.x) * (e.y - s.y));
    const cal = cb.getScaleCalibration();
    const system = cb.getMeasurementSystem();
    let text = `${areaPdf.toFixed(1)} pts²`;
    if (cal) {
      const m2 = pdfAreaToM2(areaPdf, cal);
      text = system === "imperial" ? `${m2ToFt2(m2).toFixed(2)}ft²` : `${m2.toFixed(2)}m²`;
    }

    cb.setPreviewMeasurement({
      text,
      x: (s.x + e.x) / 2,
      y: (s.y + e.y) / 2,
    });
  },

  onPointerUp(pt, cb) {
    if (!startPt) return;

    const productId = cb.getActiveProductId();
    const color = productId ? (PRODUCTS_MAP.get(productId)?.color ?? 0x14b8a6) : 0x14b8a6;
    const s = { ...startPt };
    const e = { ...pt };

    const width = Math.abs(e.x - s.x);
    const height = Math.abs(e.y - s.y);
    if (width < 0.5 || height < 0.5) {
      cb.clearPreview();
      cb.setPreviewMeasurement(null);
      startPt = null;
      isDragging = false;
      return;
    }

    cb.commitAnnotation({
      type: "area",
      id: crypto.randomUUID(),
      pageIndex: 0,
      productId,
      points: rectanglePoints(s, e),
      style: { color, alpha: 1, width: 2 },
      fill: { color, alpha: 0.25 },
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
