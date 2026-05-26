import type { CapturedShot, LayoutDef } from "../types";

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  const sAspect = img.width / img.height;
  const dAspect = dw / dh;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;
  if (sAspect > dAspect) {
    sw = img.height * dAspect;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / dAspect;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export async function compose(
  shots: CapturedShot[],
  layout: LayoutDef,
): Promise<string> {
  const { width, height } = layout.outputSize;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");

  const images = await Promise.all(shots.map((s) => loadImage(s.dataUrl)));

  switch (layout.id) {
    case "classic-strip":
      drawClassicStrip(ctx, images, width, height);
      break;
    case "grid-2x2":
      drawGrid2x2(ctx, images, width, height);
      break;
    case "polaroid":
      drawPolaroid(ctx, images, width, height);
      break;
    case "film-strip":
      drawFilmStrip(ctx, images, width, height);
      break;
    case "magazine":
      drawMagazine(ctx, images, width, height);
      break;
    case "comic":
      drawComic(ctx, images, width, height);
      break;
  }

  return canvas.toDataURL("image/png");
}

function drawClassicStrip(
  ctx: CanvasRenderingContext2D,
  imgs: HTMLImageElement[],
  W: number,
  H: number,
) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  const pad = Math.round(W * 0.05);
  const gap = Math.round(W * 0.025);
  const caption = Math.round(W * 0.16);
  const innerW = W - pad * 2;
  const innerH = H - pad * 2 - caption;
  const slotH = (innerH - gap * (imgs.length - 1)) / imgs.length;
  imgs.forEach((img, i) => {
    const y = pad + i * (slotH + gap);
    drawCover(ctx, img, pad, y, innerW, slotH);
  });
  ctx.fillStyle = "#2A2620";
  ctx.font = `italic 500 ${Math.round(caption * 0.34)}px 'DM Serif Display', Georgia, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("photo booth", W / 2, H - pad - caption / 2);
}

function drawGrid2x2(
  ctx: CanvasRenderingContext2D,
  imgs: HTMLImageElement[],
  W: number,
  H: number,
) {
  ctx.fillStyle = "#FAF7F2";
  ctx.fillRect(0, 0, W, H);
  const pad = Math.round(W * 0.04);
  const gap = Math.round(W * 0.015);
  const cellW = (W - pad * 2 - gap) / 2;
  const cellH = (H - pad * 2 - gap) / 2;
  const positions = [
    [pad, pad],
    [pad + cellW + gap, pad],
    [pad, pad + cellH + gap],
    [pad + cellW + gap, pad + cellH + gap],
  ];
  imgs.slice(0, 4).forEach((img, i) => {
    const [x, y] = positions[i];
    drawCover(ctx, img, x, y, cellW, cellH);
  });
}

function drawPolaroid(
  ctx: CanvasRenderingContext2D,
  imgs: HTMLImageElement[],
  W: number,
  H: number,
) {
  ctx.fillStyle = "#FAF7F2";
  ctx.fillRect(0, 0, W, H);
  const borderX = Math.round(W * 0.08);
  const borderTop = Math.round(W * 0.08);
  const photoSize = W - borderX * 2;
  drawCover(ctx, imgs[0], borderX, borderTop, photoSize, photoSize);
  ctx.fillStyle = "#2A2620";
  ctx.font = `400 ${Math.round(W * 0.05)}px 'DM Serif Display', Georgia, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const captionY = borderTop + photoSize + (H - borderTop - photoSize) / 2;
  ctx.fillText("a moment", W / 2, captionY);
}

function drawFilmStrip(
  ctx: CanvasRenderingContext2D,
  imgs: HTMLImageElement[],
  W: number,
  H: number,
) {
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, W, H);
  const sprocket = Math.round(H * 0.13);
  const padX = Math.round(W * 0.02);
  const gap = Math.round(W * 0.015);
  const photoH = H - sprocket * 2 - Math.round(H * 0.04);
  const photoY = sprocket + Math.round(H * 0.02);
  const slotW = (W - padX * 2 - gap * (imgs.length - 1)) / imgs.length;
  imgs.forEach((img, i) => {
    drawCover(ctx, img, padX + i * (slotW + gap), photoY, slotW, photoH);
  });
  ctx.fillStyle = "#FAF7F2";
  const holeR = sprocket * 0.28;
  const holeY1 = sprocket / 2;
  const holeY2 = H - sprocket / 2;
  const holes = 12;
  for (let i = 0; i < holes; i++) {
    const x = padX + ((W - padX * 2) / (holes - 1)) * i;
    ctx.beginPath();
    ctx.arc(x, holeY1, holeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, holeY2, holeR, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMagazine(
  ctx: CanvasRenderingContext2D,
  imgs: HTMLImageElement[],
  W: number,
  H: number,
) {
  drawCover(ctx, imgs[0], 0, 0, W, H);
  const grad = ctx.createLinearGradient(0, 0, 0, Math.round(H * 0.22));
  grad.addColorStop(0, "rgba(0,0,0,0.55)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, Math.round(H * 0.22));
  ctx.fillStyle = "#FAF7F2";
  ctx.font = `400 ${Math.round(W * 0.14)}px 'DM Serif Display', Georgia, serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("BOOTH", Math.round(W * 0.05), Math.round(H * 0.04));
  ctx.font = `500 ${Math.round(W * 0.025)}px Inter, sans-serif`;
  ctx.fillText("THE QUARTERLY · ISSUE №1", Math.round(W * 0.05), Math.round(H * 0.16));
  ctx.font = `500 ${Math.round(W * 0.04)}px Inter, sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText("$9.99 USD", W - Math.round(W * 0.05), Math.round(H * 0.04));
  const barX = W - Math.round(W * 0.22);
  const barY = H - Math.round(H * 0.08);
  const barW = Math.round(W * 0.18);
  const barH = Math.round(H * 0.04);
  ctx.fillStyle = "#FAF7F2";
  ctx.fillRect(barX - 6, barY - 6, barW + 12, barH + 12);
  ctx.fillStyle = "#111111";
  let bx = barX;
  while (bx < barX + barW) {
    const wd = 1 + Math.floor(Math.random() * 4);
    ctx.fillRect(bx, barY, wd, barH);
    bx += wd + 1 + Math.floor(Math.random() * 3);
  }
}

function drawComic(
  ctx: CanvasRenderingContext2D,
  imgs: HTMLImageElement[],
  W: number,
  H: number,
) {
  ctx.fillStyle = "#FAF7F2";
  ctx.fillRect(0, 0, W, H);
  const border = Math.round(W * 0.018);
  const outer = Math.round(W * 0.04);
  const gap = Math.round(W * 0.04);
  const cellW = (W - outer * 2 - gap) / 2;
  const cellH = (H - outer * 2 - gap) / 2;
  const positions = [
    [outer, outer],
    [outer + cellW + gap, outer],
    [outer, outer + cellH + gap],
    [outer + cellW + gap, outer + cellH + gap],
  ];
  positions.forEach(([x, y], i) => {
    if (!imgs[i]) return;
    ctx.save();
    roundRect(ctx, x, y, cellW, cellH, 8);
    ctx.clip();
    drawCover(ctx, imgs[i], x, y, cellW, cellH);
    ctx.restore();
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = border;
    roundRect(ctx, x, y, cellW, cellH, 8);
    ctx.stroke();
  });
}
