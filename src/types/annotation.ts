export interface PdfPoint {
  x: number; // PDF user units (points), 64-bit float
  y: number;
}

export interface StrokeStyle {
  color: number; // hex e.g. 0x14b8a6
  alpha: number;
  width: number; // in PDF points
}

export interface FillStyle {
  color: number;
  alpha: number;
}

export type Annotation =
  | {
      type: "line";
      id: string;
      pageIndex: number;
      productId: string | null;
      start: PdfPoint;
      end: PdfPoint;
      style: StrokeStyle;
    }
  | {
      type: "polyline";
      id: string;
      pageIndex: number;
      productId: string | null;
      points: PdfPoint[];
      style: StrokeStyle;
    }
  | {
      type: "area";
      id: string;
      pageIndex: number;
      productId: string | null;
      points: PdfPoint[]; // closed polygon — first != last (we close it on render)
      style: StrokeStyle;
      fill: FillStyle;
    };

/** Shoelace formula — returns area in PDF square units */
export function polygonArea(points: PdfPoint[]): number {
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

/** Euclidean distance between two PDF points */
export function pointDistance(a: PdfPoint, b: PdfPoint): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Total length of a polyline in PDF units */
export function polylineLength(points: PdfPoint[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += pointDistance(points[i - 1], points[i]);
  }
  return len;
}
