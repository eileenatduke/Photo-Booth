import { useEffect, useRef, useState, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSession } from "../state/session";
import { getLayout } from "../layouts";
import { openCamera, stopCamera, unmirrorFrame } from "../lib/camera";
import { compositeFrame } from "../lib/segmentation";
import { renderPresetToCanvas } from "../lib/backgrounds";
import { CountdownOverlay } from "./CountdownOverlay";
import { StepHeader } from "./StepHeader";
import type { CapturedShot } from "../types";

type Phase = "init" | "ready" | "countdown" | "flash" | "preview" | "done";

const COUNTDOWN_STEPS: Array<number | "flash"> = [3, 2, 1, "flash"];
const FLASH_MS = 260;
const PREVIEW_MS = 1000;

export function CameraView() {
  const {
    layoutId,
    bgMode,
    bgSource,
    setShots,
    replaceShot,
    incShotRetake,
    retakeQueue,
    clearRetakeQueue,
    setStep,
    shots: existingShots,
  } = useSession(
    useShallow((s) => ({
      layoutId: s.layoutId,
      bgMode: s.bgMode,
      bgSource: s.bgSource,
      setShots: s.setShots,
      replaceShot: s.replaceShot,
      incShotRetake: s.incShotRetake,
      retakeQueue: s.retakeQueue,
      clearRetakeQueue: s.clearRetakeQueue,
      setStep: s.setStep,
      shots: s.shots,
    })),
  );

  const layout = layoutId ? getLayout(layoutId) : null;
  const isRetake = retakeQueue.length > 0;
  const indicesToCapture: number[] = isRetake
    ? retakeQueue
    : Array.from({ length: layout?.shots ?? 0 }, (_, i) => i);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dimsRef = useRef<{ w: number; h: number }>({ w: 1280, h: 720 });
  const rafRef = useRef<number | null>(null);
  const backgroundRef = useRef<HTMLImageElement | HTMLCanvasElement | null>(null);

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

  useEffect(() => {
    if (bgMode === "real" || !bgSource) {
      backgroundRef.current = null;
      return;
    }
    const { w, h } = dimsRef.current;
    if (bgSource.kind === "preset") {
      backgroundRef.current = renderPresetToCanvas(bgSource.id, w, h);
    } else {
      const img = new Image();
      img.onload = () => {
        backgroundRef.current = img;
      };
      img.src = bgSource.dataUrl;
    }
  }, [bgMode, bgSource]);

  const renderLoop = useCallback(async () => {
    const video = videoRef.current;
    const canvas = previewCanvasRef.current;
    if (!video || !canvas) {
      rafRef.current = requestAnimationFrame(renderLoop);
      return;
    }
    if (video.readyState >= 2) {
      try {
        await compositeFrame({
          video,
          output: canvas,
          background: bgMode === "replace" ? backgroundRef.current : null,
          mirror: true,
        });
      } catch (e) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
          ctx.restore();
        }
      }
    }
    rafRef.current = requestAnimationFrame(renderLoop);
  }, [bgMode]);

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
      <div className="min-h-full flex flex-col p-10">
        <StepHeader
          title="Camera trouble"
          onBack={() => setStep("background")}
        />
        <div className="card p-8 max-w-lg">
          <p className="text-ink leading-relaxed">{error}</p>
          <p className="text-muted text-sm mt-3">
            Make sure no other app is using the webcam, then refresh.
          </p>
        </div>
      </div>
    );
  }

  const totalThisRound = indicesToCapture.length;

  return (
    <div className="min-h-full flex flex-col">
      <StepHeader
        title={
          phase === "ready"
            ? isRetake
              ? `Retake ${totalThisRound === 1 ? "this shot" : `${totalThisRound} shots`}`
              : "Ready when you are"
            : phase === "done"
              ? "All done!"
              : `Shot ${stepIdx + 1} of ${totalThisRound}`
        }
        subtitle={
          isRetake
            ? "Only the selected slots will be retaken."
            : "We'll take them one at a time."
        }
        onBack={
          phase === "ready"
            ? () => {
                clearRetakeQueue();
                setStep(isRetake ? "review" : "background");
              }
            : undefined
        }
      />

      <div className="flex-1 px-10 pb-10 flex items-stretch justify-center gap-8">
        <div className="relative rounded-3xl overflow-hidden bg-ink shadow-lift max-h-full aspect-video flex-1 max-w-4xl">
          <video
            ref={videoRef}
            className="hidden"
            muted
            playsInline
          />
          <canvas
            ref={previewCanvasRef}
            className="w-full h-full object-cover"
          />
          <CountdownOverlay value={countdownValue} />
          {phase === "preview" && lastShotUrl && (
            <div className="absolute inset-0 bg-ink/80 flex items-center justify-center">
              <img
                src={lastShotUrl}
                alt={`Shot ${stepIdx + 1}`}
                className="max-h-[80%] max-w-[80%] rounded-2xl shadow-lift fade-in"
              />
            </div>
          )}
        </div>

        <aside className="w-64 flex flex-col gap-4">
          <div className="card p-5">
            <p className="text-xs uppercase tracking-widest text-muted mb-2">
              Layout
            </p>
            <p className="font-serif text-xl">{layout?.name}</p>
            <p className="text-xs text-muted mt-1">
              {totalThisRound}{" "}
              {totalThisRound === 1 ? "shot" : "shots"} this round
            </p>
          </div>
          <ProgressList
            indices={indicesToCapture}
            current={stepIdx}
            phase={phase}
            captured={newShots.current}
            existing={existingShots}
          />
          {phase === "ready" && (
            <button
              className="btn-primary w-full mt-auto"
              onClick={runCaptureSequence}
            >
              {isRetake ? "Retake" : "Start"}
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}

function ProgressList({
  indices,
  current,
  phase,
  captured,
  existing,
}: {
  indices: number[];
  current: number;
  phase: Phase;
  captured: Map<number, CapturedShot>;
  existing: CapturedShot[];
}) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-widest text-muted mb-3">
        Shots
      </p>
      <ul className="space-y-2">
        {indices.map((slot, i) => {
          const done = captured.has(slot) || (phase === "ready" && existing[slot]);
          const isCurrent =
            (phase === "countdown" || phase === "flash" || phase === "preview") &&
            i === current;
          return (
            <li key={slot} className="flex items-center gap-3 text-sm">
              <span
                className={
                  "h-6 w-6 rounded-full grid place-items-center text-xs font-medium " +
                  (done
                    ? "bg-accent text-cream"
                    : isCurrent
                      ? "bg-ink text-cream"
                      : "bg-hairline text-muted")
                }
              >
                {slot + 1}
              </span>
              <span className={done ? "text-ink" : "text-muted"}>
                {done ? "Captured" : isCurrent ? "In progress…" : "Pending"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
