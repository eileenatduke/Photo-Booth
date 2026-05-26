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
        outputCategoryMask: true,
        outputConfidenceMasks: false,
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
  const mask = result.categoryMask;
  if (!mask) {
    drawPossiblyMirrored(ctx, video, w, h, mirror);
    result.close();
    return;
  }

  const maskData = mask.getAsUint8Array();
  const maskW = mask.width;
  const maskH = mask.height;

  const bgCanvas = document.createElement("canvas");
  bgCanvas.width = w;
  bgCanvas.height = h;
  const bgCtx = bgCanvas.getContext("2d")!;
  drawCover(bgCtx, background, 0, 0, w, h);

  const personCanvas = document.createElement("canvas");
  personCanvas.width = w;
  personCanvas.height = h;
  const personCtx = personCanvas.getContext("2d")!;
  drawPossiblyMirrored(personCtx, video, w, h, mirror);
  const frame = personCtx.getImageData(0, 0, w, h);

  const sx = maskW / w;
  const sy = maskH / h;
  for (let y = 0; y < h; y++) {
    const my = Math.min(maskH - 1, Math.floor(y * sy));
    for (let x = 0; x < w; x++) {
      const mx = mirror
        ? Math.min(maskW - 1, Math.floor((w - 1 - x) * sx))
        : Math.min(maskW - 1, Math.floor(x * sx));
      const m = maskData[my * maskW + mx];
      if (m !== 0) {
        const i = (y * w + x) * 4;
        frame.data[i + 3] = 0;
      }
    }
  }
  personCtx.putImageData(frame, 0, 0);

  ctx.drawImage(bgCanvas, 0, 0);
  ctx.drawImage(personCanvas, 0, 0);

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
