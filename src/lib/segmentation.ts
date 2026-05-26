import {
  FilesetResolver,
  ImageSegmenter,
} from "@mediapipe/tasks-vision";

const WASM_DIR = "/mediapipe-wasm";
const MODEL_URL = "/models/selfie_segmenter.tflite";

let segmenterPromise: Promise<ImageSegmenter> | null = null;

export async function getSegmenter(): Promise<ImageSegmenter> {
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      const fileset = await FilesetResolver.forVisionTasks(WASM_DIR);
      return ImageSegmenter.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        outputCategoryMask: false,
        outputConfidenceMasks: true,
      });
    })();
  }
  return segmenterPromise;
}

export function disposeSegmenter() {
  if (segmenterPromise) {
    segmenterPromise.then((s) => s.close()).catch(() => {});
    segmenterPromise = null;
  }
}

export type CompositeArgs = {
  video: HTMLVideoElement;
  output: HTMLCanvasElement;
  background: HTMLImageElement | HTMLCanvasElement | null;
  mirror: boolean;
};

// Reusable scratch canvases — avoids per-frame allocation.
let scratchMask: HTMLCanvasElement | null = null;
let scratchMaskBlur: HTMLCanvasElement | null = null;
let scratchPerson: HTMLCanvasElement | null = null;
let scratchBg: HTMLCanvasElement | null = null;

function ensureCanvas(
  ref: HTMLCanvasElement | null,
  w: number,
  h: number,
): HTMLCanvasElement {
  const c = ref ?? document.createElement("canvas");
  if (c.width !== w) c.width = w;
  if (c.height !== h) c.height = h;
  return c;
}

export async function compositeFrame({
  video,
  output,
  background,
  mirror,
}: CompositeArgs): Promise<void> {
  const w = output.width;
  const h = output.height;
  const ctx = output.getContext("2d");
  if (!ctx) return;

  if (!background) {
    drawPossiblyMirrored(ctx, video, w, h, mirror);
    return;
  }

  const segmenter = await getSegmenter();
  const ts = performance.now();
  const result = segmenter.segmentForVideo(video, ts);
  const masks = result.confidenceMasks;
  if (!masks || masks.length === 0) {
    drawPossiblyMirrored(ctx, video, w, h, mirror);
    result.close();
    return;
  }
  const mask = masks[0];
  const maskW = mask.width;
  const maskH = mask.height;
  const maskFloats = mask.getAsFloat32Array();

  // --- Build alpha mask at video resolution, with bilinear upsample + soft curve.
  // 1. Stamp the float mask into a small canvas as grayscale.
  scratchMask = ensureCanvas(scratchMask, maskW, maskH);
  const maskCtx = scratchMask.getContext("2d")!;
  const maskImage = maskCtx.createImageData(maskW, maskH);
  const md = maskImage.data;
  for (let i = 0; i < maskFloats.length; i++) {
    // Soft curve: pushes mid values away from 0.5 for cleaner separation
    // while keeping a smooth transition band.
    const v = maskFloats[i];
    const eased = v <= 0.5 ? 2 * v * v : 1 - 2 * (1 - v) * (1 - v);
    const a = Math.round(eased * 255);
    md[i * 4] = 255;
    md[i * 4 + 1] = 255;
    md[i * 4 + 2] = 255;
    md[i * 4 + 3] = a;
  }
  maskCtx.putImageData(maskImage, 0, 0);

  // 2. Upscale + slight blur via two-step bilinear redraw.
  scratchMaskBlur = ensureCanvas(scratchMaskBlur, w, h);
  const blurCtx = scratchMaskBlur.getContext("2d")!;
  blurCtx.clearRect(0, 0, w, h);
  blurCtx.imageSmoothingEnabled = true;
  blurCtx.imageSmoothingQuality = "high";
  // Slight CSS-style blur for edge feathering.
  blurCtx.filter = `blur(${Math.max(1, Math.round(w / 320))}px)`;
  if (mirror) {
    blurCtx.save();
    blurCtx.scale(-1, 1);
    blurCtx.drawImage(scratchMask, 0, 0, maskW, maskH, -w, 0, w, h);
    blurCtx.restore();
  } else {
    blurCtx.drawImage(scratchMask, 0, 0, maskW, maskH, 0, 0, w, h);
  }
  blurCtx.filter = "none";

  // --- Composite: background, then person * alpha.
  scratchBg = ensureCanvas(scratchBg, w, h);
  const bgCtx = scratchBg.getContext("2d")!;
  drawCover(bgCtx, background, 0, 0, w, h);

  scratchPerson = ensureCanvas(scratchPerson, w, h);
  const personCtx = scratchPerson.getContext("2d")!;
  personCtx.globalCompositeOperation = "source-over";
  drawPossiblyMirrored(personCtx, video, w, h, mirror);
  // Multiply person by alpha mask: keep only the person pixels.
  personCtx.globalCompositeOperation = "destination-in";
  personCtx.drawImage(scratchMaskBlur, 0, 0);
  personCtx.globalCompositeOperation = "source-over";

  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(scratchBg, 0, 0);
  ctx.drawImage(scratchPerson, 0, 0);

  mask.close();
  result.close();
}

function drawPossiblyMirrored(
  ctx: CanvasRenderingContext2D,
  src: CanvasImageSource,
  w: number,
  h: number,
  mirror: boolean,
) {
  ctx.save();
  if (mirror) {
    ctx.scale(-1, 1);
    ctx.drawImage(src, -w, 0, w, h);
  } else {
    ctx.drawImage(src, 0, 0, w, h);
  }
  ctx.restore();
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  src: HTMLImageElement | HTMLCanvasElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  const sw = "naturalWidth" in src ? src.naturalWidth : src.width;
  const sh = "naturalHeight" in src ? src.naturalHeight : src.height;
  if (sw === 0 || sh === 0) return;
  const sAspect = sw / sh;
  const dAspect = dw / dh;
  let cx = 0;
  let cy = 0;
  let cw = sw;
  let ch = sh;
  if (sAspect > dAspect) {
    cw = sh * dAspect;
    cx = (sw - cw) / 2;
  } else {
    ch = sw / dAspect;
    cy = (sh - ch) / 2;
  }
  ctx.drawImage(src, cx, cy, cw, ch, dx, dy, dw, dh);
}
