import * as pdfjs from "pdfjs-dist";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

let _pdfDoc: PDFDocumentProxy | null = null;
let _initialized = false;

export function initPdfWorker() {
  if (_initialized) return;
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  _initialized = true;
}

export async function loadPdf(url: string): Promise<PDFDocumentProxy> {
  initPdfWorker();
  // Disable range requests — Next.js dev server returns 400 for partial-content
  // requests on static files. The full file (~551 KB) loads fast enough.
  const doc = await pdfjs.getDocument({ url, disableRange: true, disableStream: true }).promise;
  _pdfDoc = doc;
  return doc;
}

export function getPdfDoc(): PDFDocumentProxy | null {
  return _pdfDoc;
}

/**
 * Render a PDF page to an offscreen canvas at the requested DPI.
 * PDF points are 1/72 inch, so scale = dpi / 72.
 * Always uses the viewport transform so rotation is handled correctly.
 */
export async function renderPageToCanvas(
  page: PDFPageProxy,
  dpi: number
): Promise<HTMLCanvasElement> {
  const scale = dpi / 72;
  // getViewport with scale=1 gives us the corrected width/height including rotation
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context for PDF render");

  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
}

/**
 * Get the page dimensions in PDF points (rotation-corrected).
 * Uses DPI=72 so 1 PDF pt = 1 viewport unit.
 */
export async function getPageDimensions(
  page: PDFPageProxy
): Promise<{ width: number; height: number }> {
  const vp = page.getViewport({ scale: 1 });
  return { width: vp.width, height: vp.height };
}
