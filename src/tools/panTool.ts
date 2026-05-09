import type { Tool } from "./types";

export const panTool: Tool = {
  name: "pan",
  // Pan is handled directly in CanvasView via pointer events on the camera.
  // No annotation is created.
};
