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

  return (
    <div className="flex-1 flex flex-col fade-in">
      <StepHeader
        title="Review"
        subtitle="Select any frame you'd like to retake — each one allows up to two tries."
      />

      <div className="flex-1 px-2 pb-8 flex flex-col lg:flex-row items-start gap-8">
        <div className="flex-1 w-full flex items-center justify-center">
          {busy && (
            <p className="font-body text-ink-soft text-lg py-16">
              Composing your photograph…
            </p>
          )}
          {!busy && composedDataUrl && (
            <img
              src={composedDataUrl}
              alt="Composed result"
              className="max-h-[64vh] w-auto block rounded-[3px] shadow-lift fade-in"
            />
          )}
        </div>

        <aside className="w-full lg:w-80 flex flex-col gap-4">
          <div className="card p-5">
            <p className="smallcaps mb-3">Your Portraits</p>
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
                        "w-full flex items-center gap-3 p-2 rounded-lg border transition-all text-left bg-paper " +
                        (queued
                          ? "border-champagne-deep ring-1 ring-champagne-deep shadow-soft"
                          : maxed
                            ? "border-hairline opacity-50 cursor-not-allowed"
                            : "border-hairline hover:border-champagne-deep")
                      }
                    >
                      <div className="w-14 h-14 rounded overflow-hidden bg-cream flex-shrink-0 border border-hairline">
                        <img
                          src={shot.dataUrl}
                          alt={`Shot ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-lg leading-tight text-ink">
                          Portrait {i + 1}
                        </p>
                        <p className="text-xs text-muted font-body">
                          {maxed
                            ? "No retakes left"
                            : queued
                              ? "Queued for retake"
                              : `${left} retake${left === 1 ? "" : "s"} left`}
                        </p>
                      </div>
                      <span
                        className={
                          "h-6 w-6 rounded-full border flex items-center justify-center text-xs " +
                          (queued
                            ? "bg-ink border-ink text-paper"
                            : "border-hairline bg-paper")
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
            onClick={() => queueSize > 0 && setStep("camera")}
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
            Continue
          </button>
          {layout && (
            <p className="font-body text-muted text-center">
              {layout.name} · {shots.length}{" "}
              {shots.length === 1 ? "shot" : "shots"}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
