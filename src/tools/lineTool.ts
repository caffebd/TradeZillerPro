import { Graphics } from "pixi.js";
import type { PdfPoint } from "@/types/annotation";
import type { Tool, ToolCallbacks } from "./types";
import { PRODUCTS_MAP } from "@/data/products";

let startPt: PdfPoint | null = null;
let isDragging = false;

export const lineTool: Tool = {
  name: "line",

  onPointerDown(pt, _cb) {
    startPt = pt;
    isDragging = true;
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
    startPt = null;
    isDragging = false;
  },

  onDeactivate(cb) {
    cb.clearPreview();
    startPt = null;
    isDragging = false;
  },
};
