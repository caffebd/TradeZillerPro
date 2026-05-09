export const DRAWINGS = [
  { id: "drawing1", label: "Drawing1", pdfUrl: "/FirstFloorSample.pdf" },
  { id: "drawing2", label: "Drawing2", pdfUrl: "/sample-drawing.pdf" },
] as const;

export type DrawingId = (typeof DRAWINGS)[number]["id"];
export type DrawingConfig = (typeof DRAWINGS)[number];
