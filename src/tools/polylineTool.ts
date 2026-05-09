import { Graphics } from "pixi.js";
import type { PdfPoint } from "@/types/annotation";
import type { Tool, ToolCallbacks } from "./types";
import { PRODUCTS_MAP } from "@/data/products";

let points: PdfPoint[] = [];

function drawPolylinePreview(pts: PdfPoint[], cursor: PdfPoint | null, g: Graphics, color: number, dotRadius: number) {
  g.clear();
  if (pts.length === 0) return;

  g.setStrokeStyle({ color, width: 2, alpha: 1 });
  g.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    g.lineTo(pts[i].x, pts[i].y);
  }
  if (cursor) {
    g.lineTo(cursor.x, cursor.y);
  }
  g.stroke();

  // Draw vertex dots
  for (const p of pts) {
    g.circle(p.x, p.y, dotRadius);
    g.fill({ color, alpha: 0.8 });
  }
}

export const polylineTool: Tool = {
  name: "polyline",

  onPointerDown(pt, cb) {
    points.push(pt);
    const productId = cb.getActiveProductId();
    const color = productId ? (PRODUCTS_MAP.get(productId)?.color ?? 0x14b8a6) : 0x14b8a6;
    const r = 4 / cb.getCameraScale();
    cb.updatePreview((g: Graphics) => drawPolylinePreview(points, null, g, color, r));
  },

  onPointerMove(pt, cb) {
    if (points.length === 0) return;
    const productId = cb.getActiveProductId();
    const color = productId ? (PRODUCTS_MAP.get(productId)?.color ?? 0x14b8a6) : 0x14b8a6;
    const r = 4 / cb.getCameraScale();
    cb.updatePreview((g: Graphics) => drawPolylinePreview(points, pt, g, color, r));
  },

  onDoubleClick(pt, cb) {
    // Remove the duplicate point added by the last single click before dblclick
    if (points.length > 1) points.pop();

    if (points.length < 2) {
      points = [];
      cb.clearPreview();
      return;
    }

    const productId = cb.getActiveProductId();
    const color = productId ? (PRODUCTS_MAP.get(productId)?.color ?? 0x14b8a6) : 0x14b8a6;

    cb.commitAnnotation({
      type: "polyline",
      id: crypto.randomUUID(),
      pageIndex: 0,
      productId,
      points: [...points],
      style: { color, alpha: 1, width: 2 },
    });

    points = [];
    cb.clearPreview();
  },

  onDeactivate(cb) {
    points = [];
    cb.clearPreview();
  },
};
