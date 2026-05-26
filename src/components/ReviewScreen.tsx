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
        title="The proofs"
        subtitle="Tap any frame you'd like to retake — each one allows up to two tries."
        ornament="❋"
      />
      <div className="px-10 pb-10 flex-1 flex items-stretch gap-8">
        <div className="flex-1 flex items-center justify-center">
          {busy && (
            <p className="font-body italic text-ink-soft text-lg">
              Composing your photograph…
            </p>
          )}
          {!busy && composedDataUrl && (
            <div className="relative bg-paper p-4 shadow-lift rotate-[-0.6deg]">
              <img
                src={composedDataUrl}
                alt="Composed result"
                className="max-h-[68vh] max-w-full block fade-in"
              />
            </div>
          )}
        </div>
        <aside className="w-80 flex flex-col gap-4">
          <div className="card-bordered p-5">
            <p className="smallcaps mb-3">Your shots</p>
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
                        "w-full flex items-center gap-3 p-2 rounded-xl border-2 transition-all text-left " +
                        (queued
                          ? "border-burnt bg-paper shadow-soft"
                          : maxed
                            ? "border-hairline bg-paper/40 opacity-60 cursor-not-allowed"
                            : "border-hairline bg-paper/70 hover:bg-paper")
                      }
                    >
                      <div className="w-14 h-14 rounded overflow-hidden bg-hairline flex-shrink-0 border border-hairline">
                        <img
                          src={shot.dataUrl}
                          alt={`Shot ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-lg leading-tight">
                          Shot {i + 1}
                        </p>
                        <p className="text-xs text-muted italic font-body">
                          {maxed
                            ? "No retakes left"
                            : queued
                              ? "Queued for retake"
                              : `${left} retake${left === 1 ? "" : "s"} left`}
                        </p>
                      </div>
                      <span
                        className={
                          "h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs " +
                          (queued
                            ? "bg-burnt border-burnt text-paper"
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
            To the darkroom →
          </button>
          {layout && (
            <p className="font-body italic text-muted text-center">
              {layout.name} · {shots.length}{" "}
              {shots.length === 1 ? "shot" : "shots"}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
