import { create } from "zustand";
import type { Step, LayoutId, FilterId, CapturedShot } from "../types";

export const MAX_RETAKES_PER_SHOT = 2;

export const STRIP_COLORS = [
  { id: "white", name: "White", value: "#FFFFFF" },
  { id: "blue", name: "Light Blue", value: "#A9D5F0" },
  { id: "pink", name: "Light Pink", value: "#F6C2D5" },
  { id: "teal", name: "Light Teal", value: "#A8DFD2" },
] as const;

type SessionState = {
  step: Step;
  layoutId: LayoutId | null;
  shots: CapturedShot[];
  shotRetakes: number[];
  retakeQueue: number[];
  composedDataUrl: string | null;
  filterId: FilterId;
  filteredDataUrl: string | null;
  note: string;
  stripColor: string;

  setStep: (step: Step) => void;
  setLayoutId: (id: LayoutId) => void;
  setShots: (shots: CapturedShot[]) => void;
  replaceShot: (index: number, shot: CapturedShot) => void;
  incShotRetake: (index: number) => void;
  toggleRetakeIndex: (index: number) => void;
  clearRetakeQueue: () => void;
  setComposed: (url: string | null) => void;
  setFilterId: (id: FilterId) => void;
  setFiltered: (url: string | null) => void;
  setNote: (note: string) => void;
  setStripColor: (color: string) => void;
  resetShots: () => void;
  reset: () => void;
};

const initial = {
  step: "welcome" as Step,
  layoutId: null,
  shots: [],
  shotRetakes: [],
  retakeQueue: [],
  composedDataUrl: null,
  filterId: "natural" as FilterId,
  filteredDataUrl: null,
  note: "",
  stripColor: STRIP_COLORS[0].value,
};

export const useSession = create<SessionState>((set) => ({
  ...initial,
  setStep: (step) => set({ step }),
  setLayoutId: (layoutId) => set({ layoutId }),
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
  setNote: (note) => set({ note }),
  setStripColor: (stripColor) => set({ stripColor }),
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
