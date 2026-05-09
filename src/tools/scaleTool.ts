import { Graphics } from "pixi.js";
import type { PdfPoint } from "@/types/annotation";
import { pointDistance } from "@/types/annotation";
import type { Tool, ToolCallbacks } from "./types";

let startPt: PdfPoint | null = null;

export const scaleTool: Tool = {
  name: "scale",

  onPointerDown(pt, _cb) {
    startPt = pt;
  },

  onPointerMove(pt, cb) {
    if (!startPt) return;
    const s = { ...startPt! };
    const e = { ...pt };
    const r = 5 / cb.getCameraScale();
    cb.updatePreview((g: Graphics) => {
      g.clear();
      g.setStrokeStyle({ color: 0xfbbf24, width: 2, alpha: 1 });
      g.moveTo(s.x, s.y);
      g.lineTo(e.x, e.y);
      g.stroke();
      // End markers
      g.circle(s.x, s.y, r);
      g.fill({ color: 0xfbbf24, alpha: 1 });
      g.circle(e.x, e.y, r);
      g.fill({ color: 0xfbbf24, alpha: 1 });
    });
  },

  onPointerUp(pt, cb) {
    if (!startPt) return;
    const pdfUnits = pointDistance(startPt, pt);
    if (pdfUnits < 1) {
      cb.clearPreview();
      startPt = null;
      return;
    }
    cb.openScaleModal(pdfUnits);
    cb.clearPreview();
    startPt = null;
  },

  onDeactivate(cb) {
    cb.clearPreview();
    startPt = null;
  },
};
