import { create } from "zustand";
import type { CameraState } from "@/types/camera";
import { DEFAULT_CAMERA } from "@/types/camera";

interface CameraStore {
  camera: CameraState;
  setCamera: (camera: CameraState) => void;
  updateCamera: (updater: (c: CameraState) => CameraState) => void;
}

export const useCameraStore = create<CameraStore>((set) => ({
  camera: DEFAULT_CAMERA,
  setCamera: (camera) => set({ camera }),
  updateCamera: (updater) => set((s) => ({ camera: updater(s.camera) })),
}));
