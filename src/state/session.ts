import { create } from "zustand";
import type {
  Step,
  LayoutId,
  FilterId,
  BackgroundMode,
  BackgroundSource,
  CapturedShot,
} from "../types";

export const MAX_RETAKES = 2;

type SessionState = {
  step: Step;
  layoutId: LayoutId | null;
  bgMode: BackgroundMode;
  bgSource: BackgroundSource;
  shots: CapturedShot[];
  retakeCount: number;
  composedDataUrl: string | null;
  filterId: FilterId;
  filteredDataUrl: string | null;
  qrUrl: string | null;

  setStep: (step: Step) => void;
  setLayoutId: (id: LayoutId) => void;
  setBgMode: (mode: BackgroundMode) => void;
  setBgSource: (src: BackgroundSource) => void;
  setShots: (shots: CapturedShot[]) => void;
  incRetake: () => void;
  setComposed: (url: string | null) => void;
  setFilterId: (id: FilterId) => void;
  setFiltered: (url: string | null) => void;
  setQrUrl: (url: string | null) => void;
  reset: () => void;
};

const initial = {
  step: "welcome" as Step,
  layoutId: null,
  bgMode: "real" as BackgroundMode,
  bgSource: null,
  shots: [],
  retakeCount: 0,
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
  setShots: (shots) => set({ shots }),
  incRetake: () => set((s) => ({ retakeCount: s.retakeCount + 1 })),
  setComposed: (composedDataUrl) => set({ composedDataUrl }),
  setFilterId: (filterId) => set({ filterId }),
  setFiltered: (filteredDataUrl) => set({ filteredDataUrl }),
  setQrUrl: (qrUrl) => set({ qrUrl }),
  reset: () => set({ ...initial }),
}));
