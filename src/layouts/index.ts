import type { LayoutDef, LayoutId } from "../types";

export const LAYOUTS: LayoutDef[] = [
  {
    id: "classic-strip",
    name: "Classic 4-Strip",
    shots: 4,
    shotAspect: 4 / 3,
    description: "Vertical strip, four photos, white border, caption space.",
    outputSize: { width: 720, height: 2160 },
  },
  {
    id: "grid-2x2",
    name: "2x2 Grid",
    shots: 4,
    shotAspect: 1,
    description: "Square 2x2 grid with thin gutters.",
    outputSize: { width: 1400, height: 1400 },
  },
  {
    id: "polaroid",
    name: "Single Polaroid",
    shots: 1,
    shotAspect: 1,
    description: "Square photo, wide white border, thick bottom margin.",
    outputSize: { width: 1100, height: 1300 },
  },
  {
    id: "film-strip",
    name: "Film Strip",
    shots: 3,
    shotAspect: 4 / 3,
    description: "Horizontal strip with sprocket holes.",
    outputSize: { width: 2400, height: 900 },
  },
  {
    id: "magazine",
    name: "Magazine Cover",
    shots: 1,
    shotAspect: 3 / 4,
    description: "Portrait shot with masthead and faux barcode.",
    outputSize: { width: 1200, height: 1600 },
  },
  {
    id: "comic",
    name: "Comic Panels",
    shots: 4,
    shotAspect: 1,
    description: "Comic grid with thick black borders.",
    outputSize: { width: 1400, height: 1400 },
  },
];

export const getLayout = (id: LayoutId): LayoutDef => {
  const found = LAYOUTS.find((l) => l.id === id);
  if (!found) throw new Error(`Unknown layout: ${id}`);
  return found;
};
