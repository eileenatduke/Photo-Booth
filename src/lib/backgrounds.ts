import type { BackgroundPreset } from "../types";

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: "neon-studio",
    name: "Neon Studio",
    paint: (ctx, w, h) => {
      const g = ctx.createRadialGradient(
        w * 0.5,
        h * 0.45,
        Math.min(w, h) * 0.1,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.8,
      );
      g.addColorStop(0, "#FF3DA8");
      g.addColorStop(0.5, "#7A3DFF");
      g.addColorStop(1, "#0A0820");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
  },
  {
    id: "beach",
    name: "Beach",
    paint: (ctx, w, h) => {
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.65);
      sky.addColorStop(0, "#9FD9F2");
      sky.addColorStop(1, "#F6D8A8");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
      const sea = ctx.createLinearGradient(0, h * 0.55, 0, h * 0.78);
      sea.addColorStop(0, "#3AA8C9");
      sea.addColorStop(1, "#1F6A88");
      ctx.fillStyle = sea;
      ctx.fillRect(0, h * 0.55, w, h * 0.23);
      ctx.fillStyle = "#E9C98C";
      ctx.fillRect(0, h * 0.78, w, h * 0.22);
    },
  },
  {
    id: "skyline",
    name: "City Skyline",
    paint: (ctx, w, h) => {
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#1E2742");
      sky.addColorStop(1, "#E07A4C");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#0E1422";
      let x = 0;
      while (x < w) {
        const bw = 40 + Math.random() * 80;
        const bh = h * (0.18 + Math.random() * 0.32);
        ctx.fillRect(x, h - bh, bw, bh);
        x += bw + 4;
      }
    },
  },
  {
    id: "sunset",
    name: "Gradient Sunset",
    paint: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#3F1A4E");
      g.addColorStop(0.45, "#D24B6E");
      g.addColorStop(0.8, "#F1A35B");
      g.addColorStop(1, "#FCE3B4");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
  },
  {
    id: "sage",
    name: "Sage",
    paint: (ctx, w, h) => {
      ctx.fillStyle = "#7A8B6E";
      ctx.fillRect(0, 0, w, h);
    },
  },
  {
    id: "cream",
    name: "Cream",
    paint: (ctx, w, h) => {
      ctx.fillStyle = "#FAF7F2";
      ctx.fillRect(0, 0, w, h);
    },
  },
  {
    id: "burnt",
    name: "Burnt Orange",
    paint: (ctx, w, h) => {
      ctx.fillStyle = "#C76B3C";
      ctx.fillRect(0, 0, w, h);
    },
  },
  {
    id: "vintage-wall",
    name: "Vintage Wallpaper",
    paint: (ctx, w, h) => {
      ctx.fillStyle = "#E8DDC4";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(148, 113, 70, 0.35)";
      const step = Math.max(40, Math.round(w / 24));
      for (let y = step / 2; y < h; y += step) {
        for (let x = step / 2; x < w; x += step) {
          ctx.beginPath();
          ctx.arc(x, y, step * 0.16, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
  },
];

export function renderPresetToCanvas(
  id: string,
  w: number,
  h: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const preset = BACKGROUND_PRESETS.find((p) => p.id === id);
  if (!preset) {
    ctx.fillStyle = "#FAF7F2";
    ctx.fillRect(0, 0, w, h);
    return canvas;
  }
  preset.paint(ctx, w, h);
  return canvas;
}

export function renderPresetThumb(id: string): string {
  const c = renderPresetToCanvas(id, 240, 160);
  return c.toDataURL("image/png");
}
