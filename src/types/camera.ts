export interface CameraState {
  /** PDF coordinate at the top-left corner of the viewport (64-bit) */
  originX: number;
  originY: number;
  /** Pixels per PDF point */
  scale: number;
}

export const DEFAULT_CAMERA: CameraState = {
  originX: 0,
  originY: 0,
  scale: 1,
};

/** Convert a PDF-space point to screen pixel coordinates */
export function pdfToScreen(
  pdfX: number,
  pdfY: number,
  camera: CameraState
): { x: number; y: number } {
  return {
    x: (pdfX - camera.originX) * camera.scale,
    y: (pdfY - camera.originY) * camera.scale,
  };
}

/** Convert a screen pixel coordinate to PDF-space point */
export function screenToPdf(
  screenX: number,
  screenY: number,
  camera: CameraState
): { x: number; y: number } {
  return {
    x: screenX / camera.scale + camera.originX,
    y: screenY / camera.scale + camera.originY,
  };
}

/** Pan the camera by a delta in screen pixels */
export function panCamera(
  camera: CameraState,
  dx: number,
  dy: number
): CameraState {
  return {
    ...camera,
    originX: camera.originX - dx / camera.scale,
    originY: camera.originY - dy / camera.scale,
  };
}

/** Zoom the camera centred on a screen-space point */
export function zoomCamera(
  camera: CameraState,
  screenX: number,
  screenY: number,
  delta: number
): CameraState {
  const zoomFactor = delta > 0 ? 1.12 : 1 / 1.12;
  const newScale = Math.min(Math.max(camera.scale * zoomFactor, 0.05), 32);
  // Keep the PDF point under the cursor stationary
  const pdfX = screenX / camera.scale + camera.originX;
  const pdfY = screenY / camera.scale + camera.originY;
  return {
    scale: newScale,
    originX: pdfX - screenX / newScale,
    originY: pdfY - screenY / newScale,
  };
}
