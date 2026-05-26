import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSession, MAX_RETAKES_PER_SHOT } from "../state/session";
import { getLayout } from "../layouts";
import { compose } from "../lib/compose";
import { StepHeader } from "./StepHeader";

export function ReviewScreen() {
  const {
    layoutId,
    shots,
    shotRetakes,
    retakeQueue,
    toggleRetakeIndex,
    clearRetakeQueue,
    setComposed,
    composedDataUrl,
    setStep,
  } = useSession(
    useShallow((s) => ({
      layoutId: s.layoutId,
      shots: s.shots,
      shotRetakes: s.shotRetakes,
      retakeQueue: s.retakeQueue,
      toggleRetakeIndex: s.toggleRetakeIndex,
      clearRetakeQueue: s.clearRetakeQueue,
      setComposed: s.setComposed,
      composedDataUrl: s.composedDataUrl,
      setStep: s.setStep,
    })),
  );

  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!layoutId || shots.length === 0) return;
    let cancelled = false;
    setBusy(true);
    compose(shots, getLayout(layoutId))
      .then((url) => {
        if (!cancelled) {
          setComposed(url);
          setBusy(false);
        }
      })
      .catch(() => {
        if (!cancelled) setBusy(false);
      });
  }, [layoutId, shots, setComposed]);

  const queueSize = retakeQueue.length;
  const layout = layoutId ? getLayout(layoutId) : null;

  function startRetake() {
    if (queueSize === 0) return;
    setStep("camera");
  }

  return (
    <div className="min-h-full flex flex-col">
      <StepHeader
        title="Here's the strip"
        subtitle="Tap any shot to mark it for a retake — each shot gets up to two tries."
      />
      <div className="px-10 pb-10 flex-1 flex items-stretch gap-8">
        <div className="flex-1 flex items-center justify-center">
          {busy && <p className="text-muted">Composing your photo…</p>}
          {!busy && composedDataUrl && (
            <img
              src={composedDataUrl}
              alt="Composed result"
              className="max-h-[70vh] max-w-full rounded-lg shadow-lift fade-in"
            />
          )}
        </div>
        <aside className="w-80 flex flex-col gap-4">
          <div className="card p-5">
            <p className="text-xs uppercase tracking-widest text-muted mb-3">
              Your shots
            </p>
            <ul className="space-y-2">
              {shots.map((shot, i) => {
                const retakes = shotRetakes[i] ?? 0;
                const left = MAX_RETAKES_PER_SHOT - retakes;
                const queued = retakeQueue.includes(i);
                const maxed = left <= 0;
                return (
                  <li key={i}>
                    <button
                      disabled={maxed}
                      onClick={() => toggleRetakeIndex(i)}
                      className={
                        "w-full flex items-center gap-3 p-2 rounded-xl border transition-all text-left " +
                        (queued
                          ? "border-accent bg-white shadow-soft"
                          : maxed
                            ? "border-hairline bg-white/30 opacity-60 cursor-not-allowed"
                            : "border-hairline bg-white/60 hover:bg-white")
                      }
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-hairline flex-shrink-0">
                        <img
                          src={shot.dataUrl}
                          alt={`Shot ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          Shot {i + 1}
                        </p>
                        <p className="text-xs text-muted">
                          {maxed
                            ? "No retakes left"
                            : queued
                              ? "Queued"
                              : `${left} retake${left === 1 ? "" : "s"} left`}
                        </p>
                      </div>
                      <span
                        className={
                          "h-5 w-5 rounded-full border flex items-center justify-center text-[10px] " +
                          (queued
                            ? "bg-accent border-accent text-cream"
                            : "border-hairline bg-white")
                        }
                      >
                        {queued ? "✓" : ""}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <button
            className="btn-secondary"
            disabled={queueSize === 0 || busy}
            onClick={startRetake}
          >
            Retake {queueSize > 0 ? `${queueSize} ` : ""}
            {queueSize === 1 ? "shot" : "shots"}
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              clearRetakeQueue();
              setStep("filter");
            }}
            disabled={busy || !composedDataUrl}
          >
            Continue →
          </button>
          {layout && (
            <p className="text-xs text-muted text-center">
              {layout.name} · {shots.length}{" "}
              {shots.length === 1 ? "shot" : "shots"}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
