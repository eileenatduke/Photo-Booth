export type Step =
  | "welcome"
  | "layout"
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
  | "three-strip"
  | "comic";

export type FilterId =
  | "natural"
  | "bw"
  | "sepia"
  | "vintage"
  | "color-pop";

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

export type CapturedShot = {
  dataUrl: string;
  width: number;
  height: number;
};
