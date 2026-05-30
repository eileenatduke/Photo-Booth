import type { FilterDef, FilterId } from "../types";
import { loadImage } from "../lib/compose";

export const FILTERS: FilterDef[] = [
  { id: "natural", name: "Natural", description: "No adjustment." },
  { id: "bw", name: "Black & White", description: "Classic monochrome." },
  { id: "sepia", name: "Sepia", description: "Warm vintage tone." },
  {
    id: "vintage",
    name: "Vintage",
    description: "Warm tint, vignette, subtle grain.",
  },
  {
    id: "color-pop",
    name: "Color Pop",
    description: "Boosted saturation and contrast.",
  },
];

export async function applyFilter(
  sourceDataUrl: string,
  id: FilterId,
): Promise<string> {
  const img = await loadImage(sourceDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");
  ctx.drawImage(img, 0, 0);

  if (id === "natural") return canvas.toDataURL("image/png");

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  if (id === "bw") {
    for (let i = 0; i < data.length; i += 4) {
      let gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      // punchier contrast with lighter whites
      gray = clamp((gray - 128) * 1.45 + 128 + 14);
      data[i] = data[i + 1] = data[i + 2] = gray;
    }
  } else if (id === "sepia") {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      data[i] = clamp(r * 0.393 + g * 0.769 + b * 0.189);
      data[i + 1] = clamp(r * 0.349 + g * 0.686 + b * 0.168);
      data[i + 2] = clamp(r * 0.272 + g * 0.534 + b * 0.131);
    }
  } else if (id === "vintage") {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      data[i] = clamp(r * 0.65 + gray * 0.35 + 18);
      data[i + 1] = clamp(g * 0.65 + gray * 0.35 + 8);
      data[i + 2] = clamp(b * 0.65 + gray * 0.35 - 12);
    }
  } else if (id === "color-pop") {
    const s = 1.3;
    const c = 1.12;
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      r = gray + (r - gray) * s;
      g = gray + (g - gray) * s;
      b = gray + (b - gray) * s;
      r = (r - 128) * c + 128;
      g = (g - 128) * c + 128;
      b = (b - 128) * c + 128;
      // cool it slightly so it reads less orange
      r *= 0.95;
      b *= 1.05;
      data[i] = clamp(r);
      data[i + 1] = clamp(g);
      data[i + 2] = clamp(b);
    }
  }

  ctx.putImageData(imageData, 0, 0);

  if (id === "vintage") {
    addVignette(ctx, canvas.width, canvas.height);
    addGrain(ctx, canvas.width, canvas.height);
  }

  return canvas.toDataURL("image/png");
}

function clamp(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

function addVignette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  const grad = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.35,
    w / 2,
    h / 2,
    Math.max(w, h) * 0.7,
  );
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function addGrain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  const img = ctx.getImageData(0, 0, w, h);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 18;
    data[i] = clamp(data[i] + n);
    data[i + 1] = clamp(data[i + 1] + n);
    data[i + 2] = clamp(data[i + 2] + n);
  }
  ctx.putImageData(img, 0, 0);
}
