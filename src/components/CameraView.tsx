import { useEffect, useRef, useState, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSession } from "../state/session";
import { getLayout } from "../layouts";
import { openCamera, stopCamera, unmirrorFrame } from "../lib/camera";
import { CountdownOverlay } from "./CountdownOverlay";
import type { CapturedShot } from "../types";

type Phase = "init" | "ready" | "countdown" | "flash" | "preview" | "done";

const COUNTDOWN_STEPS: Array<number | "flash"> = [3, 2, 1, "flash"];
const FLASH_MS = 260;
const PREVIEW_MS = 1000;

export function CameraView() {
  const {
    layoutId,
    setShots,
    replaceShot,
    incShotRetake,
    retakeQueue,
    clearRetakeQueue,
    setStep,
  } = useSession(
    useShallow((s) => ({
      layoutId: s.layoutId,
      setShots: s.setShots,
      replaceShot: s.replaceShot,
      incShotRetake: s.incShotRetake,
      retakeQueue: s.retakeQueue,
      clearRetakeQueue: s.clearRetakeQueue,
      setStep: s.setStep,
    })),
  );

  const layout = layoutId ? getLayout(layoutId) : null;
  const isRetake = retakeQueue.length > 0;
  const indicesToCapture: number[] = isRetake
    ? retakeQueue
    : Array.from({ length: layout?.shots ?? 0 }, (_, i) => i);

  // The on-screen frame matches the proportions of each captured photo.
  const photoAspect = layout?.shotAspect ?? 4 / 3;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dimsRef = useRef<{ w: number; h: number }>({ w: 1280, h: 720 });
  const rafRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<Phase>("init");
  const [countdownValue, setCountdownValue] = useState<
    number | "flash" | null
  >(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [lastShotUrl, setLastShotUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const newShots = useRef<Map<number, CapturedShot>>(new Map());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { stream, width, height } = await openCamera();
        if (cancelled) {
          stopCamera(stream);
          return;
        }
        streamRef.current = stream;
        dimsRef.current = { w: width, h: height };
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        if (previewCanvasRef.current) {
          previewCanvasRef.current.width = width;
          previewCanvasRef.current.height = height;
        }
        setPhase("ready");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(`Couldn't open camera: ${msg}`);
      }
    })();
    return () => {
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      stopCamera(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  const renderLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = previewCanvasRef.current;
    if (!video || !canvas) {
      rafRef.current = requestAnimationFrame(renderLoop);
      return;
    }
    if (video.readyState >= 2 && video.videoWidth > 0) {
      // Size the canvas to the video's ACTUAL frame dimensions. On phones the
      // reported track settings can be landscape while the real frame is
      // portrait (or vice versa); using videoWidth/videoHeight keeps the draw
      // 1:1 so the image is never stretched. CSS object-cover then crops it to
      // the on-screen frame, just like a normal camera.
      if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
      ) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        dimsRef.current = { w: video.videoWidth, h: video.videoHeight };
      }
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();
      }
    }
    rafRef.current = requestAnimationFrame(renderLoop);
  }, []);

  useEffect(() => {
    if (phase === "init") return;
    rafRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, renderLoop]);

  function captureCurrentFrame(): CapturedShot {
    const canvas = previewCanvasRef.current!;
    const { w, h } = dimsRef.current;
    const unmirrored = unmirrorFrame(canvas, w, h);
    return {
      dataUrl: unmirrored.toDataURL("image/png"),
      width: w,
      height: h,
    };
  }

  function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function runCaptureSequence() {
    if (!layout) return;
    newShots.current = new Map();
    setStepIdx(0);
    setLastShotUrl(null);

    for (let i = 0; i < indicesToCapture.length; i++) {
      const slotIdx = indicesToCapture[i];
      setStepIdx(i);
      setPhase("countdown");
      for (const v of COUNTDOWN_STEPS) {
        setCountdownValue(v);
        if (v === "flash") {
          setPhase("flash");
          const shot = captureCurrentFrame();
          newShots.current.set(slotIdx, shot);
          setLastShotUrl(shot.dataUrl);
          await sleep(FLASH_MS);
        } else {
          await sleep(900);
        }
      }
      setCountdownValue(null);
      setPhase("preview");
      await sleep(PREVIEW_MS);
      setLastShotUrl(null);
    }
    setPhase("done");

    if (isRetake) {
      for (const [idx, shot] of newShots.current.entries()) {
        replaceShot(idx, shot);
        incShotRetake(idx);
      }
      clearRetakeQueue();
    } else {
      const ordered: CapturedShot[] = [];
      for (let i = 0; i < layout.shots; i++) {
        const s = newShots.current.get(i);
        if (s) ordered.push(s);
      }
      setShots(ordered);
    }
    setStep("review");
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black text-white flex flex-col items-center justify-center px-6 text-center">
        <p className="text-2xl font-serif mb-3">Camera trouble</p>
        <p className="text-white/70 max-w-md">{error}</p>
        <button
          className="mt-8 px-6 py-3 rounded-full bg-white text-black text-sm"
          onClick={() => setStep("layout")}
        >
          Go back
        </button>
      </div>
    );
  }

  const totalThisRound = indicesToCapture.length;

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col">
      {/* Top: a single back affordance + the word "countdown" */}
      <div className="relative px-6 pt-6">
        {phase === "ready" && (
          <button
            onClick={() => {
              clearRetakeQueue();
              setStep(isRetake ? "review" : "layout");
            }}
            className="absolute left-6 top-6 text-white/60 hover:text-white text-[11px] uppercase tracking-[0.3em]"
          >
            &larr; Back
          </button>
        )}
        <h1 className="text-center text-white text-3xl sm:text-4xl tracking-[0.45em] uppercase font-light">
          countdown
        </h1>
      </div>

      {/* Middle: the only non-black region — the photo itself, no border */}
      <div className="flex-1 flex flex-col items-center justify-center gap-7 px-4">
        <div
          className="relative overflow-hidden bg-black"
          style={{
            aspectRatio: photoAspect,
            // Fit within both the height and width budgets while keeping the
            // photo's aspect ratio, so the frame looks right on phones too.
            height: `min(58vh, calc(92vw / ${photoAspect}))`,
            maxWidth: "92vw",
          }}
        >
          <video ref={videoRef} className="hidden" muted playsInline />
          <canvas
            ref={previewCanvasRef}
            className="w-full h-full object-cover"
          />
          <CountdownOverlay value={countdownValue} />
          {phase === "preview" && lastShotUrl && (
            <img
              src={lastShotUrl}
              alt={`Shot ${stepIdx + 1}`}
              className="absolute inset-0 w-full h-full object-cover fade-in"
            />
          )}
        </div>

        <div className="h-16 flex flex-col items-center justify-center">
          {phase === "ready" && (
            <>
              <button
                onClick={runCaptureSequence}
                className="px-10 py-4 rounded-full bg-white text-black text-sm font-medium tracking-wide hover:bg-white/90 transition"
              >
                {isRetake ? "Begin Retake" : "Start the Sitting"}
              </button>
              <p className="text-white/50 text-[11px] uppercase tracking-[0.3em] mt-3">
                {totalThisRound} {totalThisRound === 1 ? "portrait" : "portraits"}{" "}
                · 3-second timer
              </p>
            </>
          )}
          {(phase === "countdown" ||
            phase === "flash" ||
            phase === "preview") && (
            <p className="text-white/70 text-sm tracking-wide">
              Portrait {stepIdx + 1} of {totalThisRound}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
