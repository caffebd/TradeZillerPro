import { Application, Container } from "pixi.js";
import type { CameraState } from "@/types/camera";

export interface AppLayers {
  pdfLayer: Container;
  annotationLayer: Container;
  drawingLayer: Container;
}

/**
 * Apply the camera transform to a container whose children live in PDF space
 * (1 unit = 1 PDF point, origin at top-left of page).
 *
 * This is the ONLY place where camera state becomes a visual transform.
 * Tiles, annotations, and drawing-preview objects are placed in PDF
 * coordinates at creation time and never repositioned — the GPU applies
 * this container transform atomically each frame.
 *
 * result: child at PDF position (px, py) appears at screen pixel
 *   x = (px - originX) * scale
 *   y = (py - originY) * scale
 */
export function applyCameraTransform(layer: Container, camera: CameraState) {
  layer.scale.set(camera.scale);
  layer.position.set(
    Math.round(-camera.originX * camera.scale),
    Math.round(-camera.originY * camera.scale)
  );
}

let _app: Application | null = null;
let _layers: AppLayers | null = null;

export async function initPixiApp(canvas: HTMLCanvasElement): Promise<{ app: Application; layers: AppLayers }> {
  const app = new Application();

  await app.init({
    canvas,
    resizeTo: canvas.parentElement ?? canvas,
    backgroundColor: 0x1e293b, // slate-800
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  const pdfLayer = new Container();
  const annotationLayer = new Container();
  const drawingLayer = new Container();

  app.stage.addChild(pdfLayer);
  app.stage.addChild(annotationLayer);
  app.stage.addChild(drawingLayer);

  _app = app;
  _layers = { pdfLayer, annotationLayer, drawingLayer };

  return { app, layers: _layers };
}

export function getPixiApp(): Application | null {
  return _app;
}

export function getLayers(): AppLayers | null {
  return _layers;
}

export function destroyPixiApp() {
  if (_app) {
    _app.destroy(false, { children: true, texture: true });
    _app = null;
    _layers = null;
  }
}
