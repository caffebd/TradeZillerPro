import { create } from "zustand";
import type { Annotation } from "@/types/annotation";
import { DRAWINGS, type DrawingId } from "@/data/drawings";
import type { ScaleCalibration } from "@/types/scale";

interface Command {
  execute: () => void;
  undo: () => void;
  description: string;
}

interface DrawingSession {
  annotations: Annotation[];
  past: Command[];
  future: Command[];
  scaleCalibration: ScaleCalibration | null;
}

interface AnnotationStore {
  activeDrawingId: DrawingId;
  drawings: Record<DrawingId, DrawingSession>;
  annotations: Annotation[];
  past: Command[];
  future: Command[];
  scaleCalibration: ScaleCalibration | null;

  setActiveDrawing: (drawingId: DrawingId) => void;

  addAnnotation: (annotation: Annotation) => void;
  removeAnnotation: (id: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  setScaleCalibration: (calibration: ScaleCalibration | null) => void;
}

function createSession(): DrawingSession {
  return {
    annotations: [],
    past: [],
    future: [],
    scaleCalibration: null,
  };
}

const initialDrawings = Object.fromEntries(
  DRAWINGS.map((drawing) => [drawing.id, createSession()])
) as Record<DrawingId, DrawingSession>;

function mirrorActive(session: DrawingSession) {
  return {
    annotations: session.annotations,
    past: session.past,
    future: session.future,
    scaleCalibration: session.scaleCalibration,
  };
}

export const useAnnotationStore = create<AnnotationStore>((set, get) => ({
  activeDrawingId: "drawing1",
  drawings: initialDrawings,
  ...mirrorActive(initialDrawings.drawing1),

  setActiveDrawing: (drawingId) => {
    set((state) => {
      const session = state.drawings[drawingId];
      return {
        activeDrawingId: drawingId,
        ...mirrorActive(session),
      };
    });
  },

  addAnnotation: (annotation) => {
    const drawingId = get().activeDrawingId;
    const cmd: Command = {
      description: `Add ${annotation.type}`,
      execute: () =>
        set((state) => {
          const session = state.drawings[drawingId];
          const nextSession = {
            ...session,
            annotations: [...session.annotations, annotation],
          };
          return {
            drawings: { ...state.drawings, [drawingId]: nextSession },
            ...(state.activeDrawingId === drawingId ? mirrorActive(nextSession) : {}),
          };
        }),
      undo: () =>
        set((state) => {
          const session = state.drawings[drawingId];
          const nextSession = {
            ...session,
            annotations: session.annotations.filter((a) => a.id !== annotation.id),
          };
          return {
            drawings: { ...state.drawings, [drawingId]: nextSession },
            ...(state.activeDrawingId === drawingId ? mirrorActive(nextSession) : {}),
          };
        }),
    };
    cmd.execute();
    set((state) => {
      const session = state.drawings[drawingId];
      const nextSession = {
        ...session,
        past: [...session.past, cmd],
        future: [],
      };
      return {
        drawings: { ...state.drawings, [drawingId]: nextSession },
        ...(state.activeDrawingId === drawingId ? mirrorActive(nextSession) : {}),
      };
    });
  },

  removeAnnotation: (id) => {
    const drawingId = get().activeDrawingId;
    const annotation = get().drawings[drawingId].annotations.find((a) => a.id === id);
    if (!annotation) return;
    const cmd: Command = {
      description: "Delete annotation",
      execute: () =>
        set((state) => {
          const session = state.drawings[drawingId];
          const nextSession = {
            ...session,
            annotations: session.annotations.filter((a) => a.id !== id),
          };
          return {
            drawings: { ...state.drawings, [drawingId]: nextSession },
            ...(state.activeDrawingId === drawingId ? mirrorActive(nextSession) : {}),
          };
        }),
      undo: () =>
        set((state) => {
          const session = state.drawings[drawingId];
          const nextSession = {
            ...session,
            annotations: [...session.annotations, annotation],
          };
          return {
            drawings: { ...state.drawings, [drawingId]: nextSession },
            ...(state.activeDrawingId === drawingId ? mirrorActive(nextSession) : {}),
          };
        }),
    };
    cmd.execute();
    set((state) => {
      const session = state.drawings[drawingId];
      const nextSession = {
        ...session,
        past: [...session.past, cmd],
        future: [],
      };
      return {
        drawings: { ...state.drawings, [drawingId]: nextSession },
        ...(state.activeDrawingId === drawingId ? mirrorActive(nextSession) : {}),
      };
    });
  },

  undo: () => {
    const drawingId = get().activeDrawingId;
    const { past } = get().drawings[drawingId];
    if (!past.length) return;
    const cmd = past[past.length - 1];
    cmd.undo();
    set((state) => {
      const session = state.drawings[drawingId];
      const nextSession = {
        ...session,
        past: session.past.slice(0, -1),
        future: [cmd, ...session.future],
      };
      return {
        drawings: { ...state.drawings, [drawingId]: nextSession },
        ...(state.activeDrawingId === drawingId ? mirrorActive(nextSession) : {}),
      };
    });
  },

  redo: () => {
    const drawingId = get().activeDrawingId;
    const { future } = get().drawings[drawingId];
    if (!future.length) return;
    const cmd = future[0];
    cmd.execute();
    set((state) => {
      const session = state.drawings[drawingId];
      const nextSession = {
        ...session,
        past: [...session.past, cmd],
        future: session.future.slice(1),
      };
      return {
        drawings: { ...state.drawings, [drawingId]: nextSession },
        ...(state.activeDrawingId === drawingId ? mirrorActive(nextSession) : {}),
      };
    });
  },

  canUndo: () => get().drawings[get().activeDrawingId].past.length > 0,
  canRedo: () => get().drawings[get().activeDrawingId].future.length > 0,

  setScaleCalibration: (calibration) => {
    const drawingId = get().activeDrawingId;
    set((state) => {
      const session = state.drawings[drawingId];
      const nextSession = {
        ...session,
        scaleCalibration: calibration,
      };
      return {
        drawings: { ...state.drawings, [drawingId]: nextSession },
        ...(state.activeDrawingId === drawingId ? mirrorActive(nextSession) : {}),
      };
    });
  },
}));
