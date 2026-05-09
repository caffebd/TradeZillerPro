import { Graphics } from "pixi.js";
import type { PdfPoint } from "@/types/annotation";
import { polygonArea } from "@/types/annotation";
import { m2ToFt2, pdfAreaToM2 } from "@/types/scale";
import type { Tool, ToolCallbacks } from "./types";
import { PRODUCTS_MAP } from "@/data/products";

let points: PdfPoint[] = [];

function drawPolygonPreview(
  pts: PdfPoint[],
  cursor: PdfPoint | null,
  g: Graphics,
  color: number,
  dotRadius: number
) {
  g.clear();
  if (pts.length === 0) return;

  const previewPts = cursor ? [...pts, cursor] : pts;

  if (previewPts.length >= 3) {
    g.poly(previewPts).fill({ color, alpha: 0.2 });
  }

  g.setStrokeStyle({ color, width: 2, alpha: 0.9 });
  g.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    g.lineTo(pts[i].x, pts[i].y);
  }

  if (cursor) {
    g.lineTo(cursor.x, cursor.y);
  }

  g.stroke();

  for (const p of pts) {
    g.circle(p.x, p.y, dotRadius);
    g.fill({ color, alpha: 0.95 });
  }
}

function isNearFirstPoint(pt: PdfPoint, pts: PdfPoint[], cameraScale: number): boolean {
  if (pts.length < 3) return false;
  const first = pts[0];
  const tolPdf = 10 / cameraScale;
  const dx = pt.x - first.x;
  const dy = pt.y - first.y;
  return dx * dx + dy * dy <= tolPdf * tolPdf;
}

function setLiveAreaLabel(cb: ToolCallbacks, pts: PdfPoint[]) {
  if (pts.length < 3) {
    cb.setPreviewMeasurement(null);
    return;
  }

  const areaPdf = polygonArea(pts);
  const cx = pts.reduce((sum, p) => sum + p.x, 0) / pts.length;
  const cy = pts.reduce((sum, p) => sum + p.y, 0) / pts.length;

  const cal = cb.getScaleCalibration();
  const system = cb.getMeasurementSystem();

  let text = `${areaPdf.toFixed(1)} pts²`;
  if (cal) {
    const areaM2 = pdfAreaToM2(areaPdf, cal);
    text = system === "imperial" ? `${m2ToFt2(areaM2).toFixed(2)}ft²` : `${areaM2.toFixed(2)}m²`;
  }

  cb.setPreviewMeasurement({ text, x: cx, y: cy });
}

export const polygonTool: Tool = {
  name: "polygon",

  onPointerDown(pt, cb) {
    const productId = cb.getActiveProductId();
    const color = productId ? (PRODUCTS_MAP.get(productId)?.color ?? 0x14b8a6) : 0x14b8a6;

    if (isNearFirstPoint(pt, points, cb.getCameraScale())) {
      cb.commitAnnotation({
        type: "area",
        id: crypto.randomUUID(),
        pageIndex: 0,
        productId,
        points: [...points],
        style: { color, alpha: 1, width: 2 },
        fill: { color, alpha: 0.25 },
      });

      points = [];
      cb.clearPreview();
      cb.setPreviewMeasurement(null);
      return;
    }

    points.push(pt);

    const r = 4 / cb.getCameraScale();
    cb.updatePreview((g: Graphics) => drawPolygonPreview(points, null, g, color, r));
    setLiveAreaLabel(cb, points);
  },

  onPointerMove(pt, cb) {
    if (points.length === 0) return;

    const productId = cb.getActiveProductId();
    const color = productId ? (PRODUCTS_MAP.get(productId)?.color ?? 0x14b8a6) : 0x14b8a6;
    const r = 4 / cb.getCameraScale();

    cb.updatePreview((g: Graphics) => drawPolygonPreview(points, pt, g, color, r));
    setLiveAreaLabel(cb, [...points, pt]);
  },

  onDeactivate(cb) {
    points = [];
    cb.clearPreview();
    cb.setPreviewMeasurement(null);
  },
};
