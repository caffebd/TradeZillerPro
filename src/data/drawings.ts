export const DRAWINGS = [
  { id: "drawing1", label: "Drawing1", pdfUrl: "/sample-drawing.pdf" },
  { id: "drawing2", label: "Drawing2", pdfUrl: "/FirstFloorSample.pdf" },
] as const;

export type DrawingId = (typeof DRAWINGS)[number]["id"];
export type DrawingConfig = (typeof DRAWINGS)[number];
