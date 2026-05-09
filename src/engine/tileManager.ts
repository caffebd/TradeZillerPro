import { Sprite, Texture, Container } from "pixi.js";
import type { PDFPageProxy } from "pdfjs-dist";
import { renderPageToCanvas } from "./pdfRenderer";
import type { CameraState } from "@/types/camera";

const TILE_SIZE = 512;
const MAX_CACHED_TILES = 300;

const DPR = typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1;

// Detail overlay: after the camera stops moving, re-render ONLY the visible
// viewport at actual screen-pixel density. Perfect quality, fast because
// pdf.js culls off-screen content for the visible region only.
const DETAIL_DEBOUNCE_MS = 220;
const DETAIL_MIN_SCALE = 1.5;

type DpiLevel = 72 | 144 | 288;

interface TileKey {
  pageIndex: number;
  dpi: DpiLevel;
  col: number;
  row: number;
}

interface CachedTile {
  key: string;
  texture: Texture;
  sprite: Sprite;
  lastUsed: number;
}

function tileKeyStr(k: TileKey): string {
  return `${k.pageIndex}:${k.dpi}:${k.col}:${k.row}`;
}

function selectDpi(scale: number): DpiLevel {
  if (scale >= 3) return 288;
  if (scale >= 0.8) return 144;
  return 72;
}

/** Physical DPI to render at, capped at 288 to avoid out-of-memory on large pages. */
function renderDpi(dpi: DpiLevel): number {
  return Math.min(dpi * DPR, 288);
}

export class TileManager {
  private cache = new Map<string, CachedTile>();
  private pageCanvases = new Map<string, HTMLCanvasElement>();
  private pageCanvasLoading = new Set<string>();
  /**
   * The container passed in is the `pdfLayer` from PixiApp. Its transform is
   * driven by `applyCameraTransform(pdfLayer, camera)` in CanvasView.
   * All tiles and the detail overlay sprite are children of this container
   * and therefore live in PDF coordinate space — no JS repositioning ever needed.
   */
  private container: Container;
  private pages: Map<number, PDFPageProxy>;

  // Detail overlay — also a child of `container` (PDF space)
  private detailSprite: Sprite | null = null;
  private detailDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private detailGeneration = 0;

  // Latest viewport info, needed when the debounce fires
  private liveCamera: CameraState = { originX: 0, originY: 0, scale: 1 };
  private liveCanvasW = 0;
  private liveCanvasH = 0;

  constructor(container: Container, pages: Map<number, PDFPageProxy>) {
    this.container = container;
    this.pages = pages;
  }

  // ── Public entry point ────────────────────────────────────────────────────
  // Called on every camera change. Synchronous: just records the camera,
  // clears the stale detail overlay, and fires background tile loading.
  // NO per-tile position math here — the pdfLayer container transform
  // (set by applyCameraTransform in CanvasView) handles all positioning.

  updateViewport(camera: CameraState, canvasWidth: number, canvasHeight: number) {
    this.liveCamera = camera;
    this.liveCanvasW = canvasWidth;
    this.liveCanvasH = canvasHeight;

    // Clear stale detail overlay immediately on any camera move
    this.detailGeneration++;
    this.clearDetailOverlay();
    if (this.detailDebounceTimer !== null) {
      clearTimeout(this.detailDebounceTimer);
      this.detailDebounceTimer = null;
    }

    if (camera.scale >= DETAIL_MIN_SCALE) {
      const gen = this.detailGeneration;
      this.detailDebounceTimer = setTimeout(() => {
        this.detailDebounceTimer = null;
        if (gen !== this.detailGeneration) return;
        this.runDetailOverlay(gen);
      }, DETAIL_DEBOUNCE_MS);
    }

    // Background tile loading — fire and forget
    this.loadVisibleTiles(camera, canvasWidth, canvasHeight);
  }

  // ── Tile loading ──────────────────────────────────────────────────────────

  private async loadVisibleTiles(
    camera: CameraState,
    canvasWidth: number,
    canvasHeight: number
  ) {
    const dpi = selectDpi(camera.scale);
    const page = this.pages.get(0);
    if (!page) return;

    await this.ensurePageCanvas(0, dpi, page);

    const pageCanvas = this.pageCanvases.get(`0:${dpi}`);
    if (!pageCanvas) return;

    const physicalDpi = renderDpi(dpi);
    // How many PDF points does one tile span?
    const tilePdfSize = (TILE_SIZE * 72) / physicalDpi;

    const visMinX = camera.originX;
    const visMinY = camera.originY;
    const visMaxX = camera.originX + canvasWidth / camera.scale;
    const visMaxY = camera.originY + canvasHeight / camera.scale;

    const cols = Math.ceil(pageCanvas.width / TILE_SIZE);
    const rows = Math.ceil(pageCanvas.height / TILE_SIZE);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tMinX = col * tilePdfSize;
        const tMinY = row * tilePdfSize;
        if (
          tMinX + tilePdfSize < visMinX || tMinX > visMaxX ||
          tMinY + tilePdfSize < visMinY || tMinY > visMaxY
        ) continue;
        await this.ensureTile({ pageIndex: 0, dpi, col, row }, pageCanvas, tilePdfSize);
      }
    }

    this.evict();
  }

  private async ensurePageCanvas(pageIndex: number, dpi: DpiLevel, page: PDFPageProxy) {
    const cacheKey = `${pageIndex}:${dpi}`;
    if (this.pageCanvases.has(cacheKey) || this.pageCanvasLoading.has(cacheKey)) return;
    this.pageCanvasLoading.add(cacheKey);
    try {
      const canvas = await renderPageToCanvas(page, renderDpi(dpi));
      this.pageCanvases.set(cacheKey, canvas);
    } finally {
      this.pageCanvasLoading.delete(cacheKey);
    }
  }

  private async ensureTile(key: TileKey, pageCanvas: HTMLCanvasElement, tilePdfSize: number) {
    const keyStr = tileKeyStr(key);
    if (this.cache.has(keyStr)) {
      this.cache.get(keyStr)!.lastUsed = Date.now();
      return;
    }

    const sx = key.col * TILE_SIZE;
    const sy = key.row * TILE_SIZE;
    const sw = Math.min(TILE_SIZE, pageCanvas.width - sx);
    const sh = Math.min(TILE_SIZE, pageCanvas.height - sy);
    if (sw <= 0 || sh <= 0) return;

    const tileCanvas = document.createElement("canvas");
    tileCanvas.width = sw;
    tileCanvas.height = sh;
    const ctx = tileCanvas.getContext("2d")!;
    ctx.drawImage(pageCanvas, sx, sy, sw, sh, 0, 0, sw, sh);

    const texture = Texture.from(tileCanvas);
    texture.source.scaleMode = "linear";

    const sprite = new Sprite(texture);
    sprite.label = keyStr;

    // Position in PDF space — NEVER changes after creation.
    // The container transform (applyCameraTransform) handles pan/zoom.
    // tilePdfSize = how many PDF points this tile spans
    const pdfX = key.col * tilePdfSize;
    const pdfY = key.row * tilePdfSize;
    // Handle edge tiles that are smaller than TILE_SIZE
    const actualPdfW = (sw / TILE_SIZE) * tilePdfSize;
    const actualPdfH = (sh / TILE_SIZE) * tilePdfSize;
    sprite.position.set(pdfX, pdfY);
    sprite.scale.set(actualPdfW / sw, actualPdfH / sh);

    this.container.addChild(sprite);
    this.cache.set(keyStr, { key: keyStr, texture, sprite, lastUsed: Date.now() });
  }

  // ── Detail overlay (also in PDF space) ───────────────────────────────────

  private async runDetailOverlay(generation: number) {
    const page = this.pages.get(0);
    if (!page) return;

    const camera = this.liveCamera;
    const canvasWidth = this.liveCanvasW;
    const canvasHeight = this.liveCanvasH;

    // Render at physical pixel density
    const physScale = camera.scale * DPR;
    const physW = Math.ceil(canvasWidth * DPR);
    const physH = Math.ceil(canvasHeight * DPR);

    const canvas = document.createElement("canvas");
    canvas.width = physW;
    canvas.height = physH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Offset so the visible PDF region falls in the canvas bounds.
    // pdf.js culls off-screen content — this makes it fast at high zoom.
    ctx.translate(
      -Math.round(camera.originX * physScale),
      -Math.round(camera.originY * physScale)
    );

    const viewport = page.getViewport({ scale: physScale });
    try {
      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (err) {
      console.warn("[detail-overlay] pdf.js render failed", err);
      return;
    }

    if (generation !== this.detailGeneration) return;

    const texture = Texture.from(canvas);
    texture.source.scaleMode = "linear";

    if (generation !== this.detailGeneration) { texture.destroy(true); return; }

    const sprite = new Sprite(texture);

    // Position in PDF space: top-left corner of visible region.
    // The sprite covers (canvasWidth/scale) × (canvasHeight/scale) PDF units.
    // Texture has physW × physH physical pixels. After the pdfLayer container
    // transform (× camera.scale) and Pixi's DPR scaling, 1 PDF unit becomes
    // (camera.scale × DPR) physical pixels. So the sprite renders at:
    //   (canvasWidth/scale × scale × DPR) = canvasWidth × DPR = physW physical px
    // → 1 texture pixel : 1 screen pixel, perfect sharpness.
    sprite.position.set(camera.originX, camera.originY);
    sprite.scale.set(
      (canvasWidth / camera.scale) / physW,
      (canvasHeight / camera.scale) / physH
    );

    this.clearDetailOverlay();
    this.detailSprite = sprite;
    this.container.addChild(sprite);
  }

  private clearDetailOverlay() {
    if (this.detailSprite) {
      this.container.removeChild(this.detailSprite);
      this.detailSprite.destroy({ texture: true });
      this.detailSprite = null;
    }
  }

  // ── Eviction ──────────────────────────────────────────────────────────────

  private evict() {
    if (this.cache.size <= MAX_CACHED_TILES) return;
    const sorted = [...this.cache.entries()].sort((a, b) => a[1].lastUsed - b[1].lastUsed);
    for (const [key, tile] of sorted.slice(0, this.cache.size - MAX_CACHED_TILES)) {
      tile.sprite.destroy({ texture: true });
      this.cache.delete(key);
    }
  }

  destroy() {
    if (this.detailDebounceTimer !== null) clearTimeout(this.detailDebounceTimer);
    this.clearDetailOverlay();
    for (const tile of this.cache.values()) tile.sprite.destroy({ texture: true });
    this.cache.clear();
  }
}
