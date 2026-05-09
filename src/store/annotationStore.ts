import { create } from "zustand";
import type { Annotation } from "@/types/annotation";

interface Command {
  execute: () => void;
  undo: () => void;
  description: string;
}

interface AnnotationStore {
  annotations: Annotation[];
  past: Command[];
  future: Command[];

  addAnnotation: (annotation: Annotation) => void;
  removeAnnotation: (id: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const useAnnotationStore = create<AnnotationStore>((set, get) => ({
  annotations: [],
  past: [],
  future: [],

  addAnnotation: (annotation) => {
    const cmd: Command = {
      description: `Add ${annotation.type}`,
      execute: () =>
        set((s) => ({ annotations: [...s.annotations, annotation] })),
      undo: () =>
        set((s) => ({
          annotations: s.annotations.filter((a) => a.id !== annotation.id),
        })),
    };
    cmd.execute();
    set((s) => ({ past: [...s.past, cmd], future: [] }));
  },

  removeAnnotation: (id) => {
    const annotation = get().annotations.find((a) => a.id === id);
    if (!annotation) return;
    const cmd: Command = {
      description: "Delete annotation",
      execute: () =>
        set((s) => ({ annotations: s.annotations.filter((a) => a.id !== id) })),
      undo: () =>
        set((s) => ({ annotations: [...s.annotations, annotation] })),
    };
    cmd.execute();
    set((s) => ({ past: [...s.past, cmd], future: [] }));
  },

  undo: () => {
    const { past } = get();
    if (!past.length) return;
    const cmd = past[past.length - 1];
    cmd.undo();
    set((s) => ({
      past: s.past.slice(0, -1),
      future: [cmd, ...s.future],
    }));
  },

  redo: () => {
    const { future } = get();
    if (!future.length) return;
    const cmd = future[0];
    cmd.execute();
    set((s) => ({
      past: [...s.past, cmd],
      future: s.future.slice(1),
    }));
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}));
