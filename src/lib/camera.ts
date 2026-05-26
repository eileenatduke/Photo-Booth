export type CameraStream = {
  stream: MediaStream;
  width: number;
  height: number;
};

export async function openCamera(): Promise<CameraStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: "user",
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
  });
  const track = stream.getVideoTracks()[0];
  const settings = track.getSettings();
  return {
    stream,
    width: settings.width ?? 1280,
    height: settings.height ?? 720,
  };
}

export function stopCamera(stream: MediaStream | null) {
  if (!stream) return;
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

export function unmirrorFrame(
  source: HTMLCanvasElement | HTMLVideoElement,
  sw: number,
  sh: number,
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = sw;
  out.height = sh;
  const ctx = out.getContext("2d")!;
  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(source, -sw, 0, sw, sh);
  ctx.restore();
  return out;
}
