"use client";
import { Graphics, Text, Container } from "pixi.js";
import type { Annotation } from "@/types/annotation";
import {
  polygonArea,
  polylineLength,
  pointDistance,
} from "@/types/annotation";
import type { CameraState } from "@/types/camera";
import type { ScaleCalibration } from "@/types/scale";
import { m2ToFt2, metresToFeet, pdfAreaToM2, pdfLengthToMetres } from "@/types/scale";
import type { MeasurementSystem } from "@/store/uiStore";

// The annotationLayer container has applyCameraTransform applied in CanvasView,
// so all coordinates here are in PDF space (1 unit = 1 PDF point).
// Labels are placed in PDF space too but their fontSize is specified in PDF units
// scaled so they appear at a fixed screen pixel size regardless of zoom.

let gfx: Graphics | null = null;
const labelMap = new Map<string, Text>();

function formatMeasurement(
  ann: Annotation,
  cal: ScaleCalibration | null,
  measurementSystem: MeasurementSystem
): string {
  if (!cal) return "";
  if (ann.type === "area") {
    const areaM2 = pdfAreaToM2(polygonArea(ann.points), cal);
    if (measurementSystem === "imperial") {
      return `${m2ToFt2(areaM2).toFixed(2)} ft²`;
    }
    return `${areaM2.toFixed(2)} m²`;
  }
  if (ann.type === "line") {
    const lenM = pdfLengthToMetres(pointDistance(ann.start, ann.end), cal);
    if (measurementSystem === "imperial") {
      return `${metresToFeet(lenM).toFixed(2)} ft`;
    }
    return `${lenM.toFixed(2)} m`;
  }
  if (ann.type === "polyline") {
    const lenM = pdfLengthToMetres(polylineLength(ann.points), cal);
    if (measurementSystem === "imperial") {
      return `${metresToFeet(lenM).toFixed(2)} ft`;
    }
    return `${lenM.toFixed(2)} m`;
  }
  return "";
}

/** Draw the path of a single annotation onto the provided Graphics object. */
function drawAnnotationPath(g: Graphics, ann: Annotation) {
  if (ann.type === "line") {
    g.moveTo(ann.start.x, ann.start.y);
    g.lineTo(ann.end.x, ann.end.y);
    g.stroke();
  } else if (ann.type === "polyline") {
    g.moveTo(ann.points[0].x, ann.points[0].y);
    for (let i = 1; i < ann.points.length; i++) {
      g.lineTo(ann.points[i].x, ann.points[i].y);
    }
    g.stroke();
  } else if (ann.type === "area") {
    g.moveTo(ann.points[0].x, ann.points[0].y);
    for (let i = 1; i < ann.points.length; i++) {
      g.lineTo(ann.points[i].x, ann.points[i].y);
    }
    g.lineTo(ann.points[0].x, ann.points[0].y);
    g.stroke();
  }
}

export function renderAnnotations(
  container: Container,
  annotations: Annotation[],
  camera: CameraState,
  calibration: ScaleCalibration | null,
  measurementSystem: MeasurementSystem,
  highlightedId: string | null = null
) {
  if (!gfx) {
    gfx = new Graphics();
    container.addChild(gfx);
  }

  // Guard: if the Pixi context was destroyed (e.g. app torn down during navigation)
  // recreate the graphics object rather than calling methods on a dead instance.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((gfx as any).context === null) {
    gfx = new Graphics();
    container.addChild(gfx);
  }

  gfx.clear();

  // ── Highlight pass (drawn first so it appears as a glow behind the annotation) ──
  if (highlightedId) {
    const ann = annotations.find((a) => a.id === highlightedId);
    if (ann) {
      const hw = ann.style.width * 5;
      gfx.setStrokeStyle({ color: 0xffffff, width: hw, alpha: 0.5 });
      drawAnnotationPath(gfx, ann);
    }
  }

  // Remove labels for deleted annotations
  const currentIds = new Set(annotations.map((a) => a.id));
  for (const [id, label] of labelMap) {
    if (!currentIds.has(id)) {
      label.destroy();
      labelMap.delete(id);
    }
  }

  // Label font size: we want ~15 screen pixels regardless of zoom.
  // Since the container is scaled by camera.scale, divide by it.
  const labelFontSize = 15 / camera.scale;

  for (const ann of annotations) {
    const color = ann.style.color;
    const alpha = ann.style.alpha;
    // Stroke width in PDF units → stays constant physical thickness on screen
    const strokeWidth = ann.style.width * 0.5;
    gfx.setStrokeStyle({ color, width: strokeWidth, alpha });

    if (ann.type === "line") {
      gfx.moveTo(ann.start.x, ann.start.y);
      gfx.lineTo(ann.end.x, ann.end.y);
      gfx.stroke();
      const mx = (ann.start.x + ann.end.x) / 2;
      const my = (ann.start.y + ann.end.y) / 2;
      updateLabel(ann.id, container, mx, my, formatMeasurement(ann, calibration, measurementSystem), labelFontSize);
    } else if (ann.type === "polyline") {
      gfx.moveTo(ann.points[0].x, ann.points[0].y);
      for (let i = 1; i < ann.points.length; i++) {
        gfx.lineTo(ann.points[i].x, ann.points[i].y);
      }
      gfx.stroke();
      if (ann.points.length >= 2) {
        const mid = ann.points[Math.floor(ann.points.length / 2)];
        updateLabel(ann.id, container, mid.x, mid.y, formatMeasurement(ann, calibration, measurementSystem), labelFontSize);
      }
    } else if (ann.type === "area") {
      gfx.poly(ann.points).fill({ color: ann.fill.color, alpha: ann.fill.alpha });
      gfx.moveTo(ann.points[0].x, ann.points[0].y);
      for (let i = 1; i < ann.points.length; i++) {
        gfx.lineTo(ann.points[i].x, ann.points[i].y);
      }
      gfx.lineTo(ann.points[0].x, ann.points[0].y);
      gfx.stroke();
      const cx = ann.points.reduce((s, p) => s + p.x, 0) / ann.points.length;
      const cy = ann.points.reduce((s, p) => s + p.y, 0) / ann.points.length;
      updateLabel(ann.id, container, cx, cy, formatMeasurement(ann, calibration, measurementSystem), labelFontSize);
    }
  }
}

function updateLabel(
  id: string,
  container: Container,
  x: number,
  y: number,
  text: string,
  fontSize: number
) {
  if (!text) {
    if (labelMap.has(id)) labelMap.get(id)!.visible = false;
    return;
  }

  const dpr = typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1;

  let label = labelMap.get(id);
  if (!label) {
    label = new Text({
      text,
      style: {
        fontSize,
        fill: 0xffffff,
        fontWeight: "bold",
        fontFamily: "system-ui, -apple-system, sans-serif",
        dropShadow: { color: 0x000000, alpha: 0.9, blur: 4, distance: 0 },
        stroke: { color: 0x000000, width: 3 },
      },
      resolution: dpr * 2,
    });
    label.anchor.set(0.5);
    container.addChild(label);
    labelMap.set(id, label);
  } else {
    label.text = text;
    label.style.fontSize = fontSize;
  }

  label.visible = true;
  label.position.set(x, y);
}

export function destroyAnnotationRenderer() {
  gfx?.destroy();
  gfx = null;
  for (const label of labelMap.values()) label.destroy();
  labelMap.clear();
}
