import { Graphics } from "pixi.js";
import type { PdfPoint } from "@/types/annotation";
import type { Tool, ToolCallbacks } from "./types";
import { PRODUCTS_MAP } from "@/data/products";

let points: PdfPoint[] = [];

function drawAreaPreview(pts: PdfPoint[], cursor: PdfPoint | null, g: Graphics, color: number, dotRadius: number) {
  g.clear();
  if (pts.length === 0) return;

  const allPts = cursor ? [...pts, cursor] : pts;

  if (allPts.length >= 3) {
    // Filled polygon
    g.poly(allPts.map((p) => ({ x: p.x, y: p.y }))).fill({ color, alpha: 0.2 });
  }

  // Outline
  g.setStrokeStyle({ color, width: 2, alpha: 0.9 });
  g.moveTo(allPts[0].x, allPts[0].y);
  for (let i = 1; i < allPts.length; i++) {
    g.lineTo(allPts[i].x, allPts[i].y);
  }
  if (pts.length >= 2) {
    // Close back to first point as a dashed guide
    g.lineTo(allPts[0].x, allPts[0].y);
  }
  g.stroke();

  // Vertex dots
  for (const p of pts) {
    g.circle(p.x, p.y, dotRadius);
    g.fill({ color, alpha: 1 });
  }
}

export const areaTool: Tool = {
  name: "area",

  onPointerDown(pt, cb) {
    points.push(pt);
    const productId = cb.getActiveProductId();
    const color = productId ? (PRODUCTS_MAP.get(productId)?.color ?? 0x14b8a6) : 0x14b8a6;
    const r = 4 / cb.getCameraScale();
    cb.updatePreview((g: Graphics) => drawAreaPreview(points, null, g, color, r));
  },

  onPointerMove(pt, cb) {
    if (points.length === 0) return;
    const productId = cb.getActiveProductId();
    const color = productId ? (PRODUCTS_MAP.get(productId)?.color ?? 0x14b8a6) : 0x14b8a6;
    const r = 4 / cb.getCameraScale();
    cb.updatePreview((g: Graphics) => drawAreaPreview(points, pt, g, color, r));
  },

  onDoubleClick(_pt, cb) {
    // Remove duplicate point from the last single click
    if (points.length > 1) points.pop();

    if (points.length < 3) {
      points = [];
      cb.clearPreview();
      return;
    }

    const productId = cb.getActiveProductId();
    const color = productId ? (PRODUCTS_MAP.get(productId)?.color ?? 0x14b8a6) : 0x14b8a6;

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
  },

  onDeactivate(cb) {
    points = [];
    cb.clearPreview();
  },
};
