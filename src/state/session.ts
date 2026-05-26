import { create } from "zustand";
import type {
  Step,
  LayoutId,
  FilterId,
  BackgroundMode,
  BackgroundSource,
  CapturedShot,
} from "../types";

export const MAX_RETAKES_PER_SHOT = 2;

type SessionState = {
  step: Step;
  layoutId: LayoutId | null;
  bgMode: BackgroundMode;
  bgSource: BackgroundSource;
  shots: CapturedShot[];
  shotRetakes: number[];
  retakeQueue: number[];
  composedDataUrl: string | null;
  filterId: FilterId;
  filteredDataUrl: string | null;
  qrUrl: string | null;

  setStep: (step: Step) => void;
  setLayoutId: (id: LayoutId) => void;
  setBgMode: (mode: BackgroundMode) => void;
  setBgSource: (src: BackgroundSource) => void;
  setShots: (shots: CapturedShot[]) => void;
  replaceShot: (index: number, shot: CapturedShot) => void;
  incShotRetake: (index: number) => void;
  toggleRetakeIndex: (index: number) => void;
  clearRetakeQueue: () => void;
  setComposed: (url: string | null) => void;
  setFilterId: (id: FilterId) => void;
  setFiltered: (url: string | null) => void;
  setQrUrl: (url: string | null) => void;
  resetShots: () => void;
  reset: () => void;
};

const initial = {
  step: "welcome" as Step,
  layoutId: null,
  bgMode: "real" as BackgroundMode,
  bgSource: null,
  shots: [],
  shotRetakes: [],
  retakeQueue: [],
  composedDataUrl: null,
  filterId: "natural" as FilterId,
  filteredDataUrl: null,
  qrUrl: null,
};

export const useSession = create<SessionState>((set) => ({
  ...initial,
  setStep: (step) => set({ step }),
  setLayoutId: (layoutId) => set({ layoutId }),
  setBgMode: (bgMode) => set({ bgMode }),
  setBgSource: (bgSource) => set({ bgSource }),
  setShots: (shots) =>
    set({
      shots,
      shotRetakes: shots.map(() => 0),
      retakeQueue: [],
    }),
  replaceShot: (index, shot) =>
    set((s) => {
      const next = s.shots.slice();
      next[index] = shot;
      return { shots: next };
    }),
  incShotRetake: (index) =>
    set((s) => {
      const next = s.shotRetakes.slice();
      next[index] = (next[index] ?? 0) + 1;
      return { shotRetakes: next };
    }),
  toggleRetakeIndex: (index) =>
    set((s) => {
      const has = s.retakeQueue.includes(index);
      return {
        retakeQueue: has
          ? s.retakeQueue.filter((i) => i !== index)
          : [...s.retakeQueue, index].sort((a, b) => a - b),
      };
    }),
  clearRetakeQueue: () => set({ retakeQueue: [] }),
  setComposed: (composedDataUrl) => set({ composedDataUrl }),
  setFilterId: (filterId) => set({ filterId }),
  setFiltered: (filteredDataUrl) => set({ filteredDataUrl }),
  setQrUrl: (qrUrl) => set({ qrUrl }),
  resetShots: () =>
    set({
      shots: [],
      shotRetakes: [],
      retakeQueue: [],
      composedDataUrl: null,
      filteredDataUrl: null,
    }),
  reset: () => set({ ...initial }),
}));
