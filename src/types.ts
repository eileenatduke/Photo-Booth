export type Step =
  | "welcome"
  | "layout"
  | "background"
  | "camera"
  | "capturing"
  | "review"
  | "filter"
  | "output";

export type LayoutId =
  | "classic-strip"
  | "grid-2x2"
  | "polaroid"
  | "film-strip"
  | "magazine"
  | "comic";

export type FilterId =
  | "natural"
  | "bw"
  | "sepia"
  | "vintage"
  | "color-pop";

export type BackgroundMode = "real" | "replace";

export type BackgroundSource =
  | { kind: "preset"; id: string }
  | { kind: "custom"; dataUrl: string }
  | null;

export type LayoutDef = {
  id: LayoutId;
  name: string;
  shots: number;
  shotAspect: number;
  description: string;
  outputSize: { width: number; height: number };
};

export type FilterDef = {
  id: FilterId;
  name: string;
  description: string;
};

export type BackgroundPreset = {
  id: string;
  name: string;
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
};

export type CapturedShot = {
  dataUrl: string;
  width: number;
  height: number;
};
