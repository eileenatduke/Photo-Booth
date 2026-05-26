import { useEffect, useState } from "react";
import { useSession, MAX_RETAKES } from "../state/session";
import { getLayout } from "../layouts";
import { compose } from "../lib/compose";
import { StepHeader } from "./StepHeader";

export function ReviewScreen() {
  const {
    layoutId,
    shots,
    setComposed,
    composedDataUrl,
    retakeCount,
    incRetake,
    setStep,
    setShots,
  } = useSession((s) => ({
    layoutId: s.layoutId,
    shots: s.shots,
    setComposed: s.setComposed,
    composedDataUrl: s.composedDataUrl,
    retakeCount: s.retakeCount,
    incRetake: s.incRetake,
    setStep: s.setStep,
    setShots: s.setShots,
  }));

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
    return () => {
      cancelled = true;
    };
  }, [layoutId, shots, setComposed]);

  const retakesLeft = MAX_RETAKES - retakeCount;
  const canRetake = retakesLeft > 0;

  function handleRetake() {
    if (!canRetake) return;
    incRetake();
    setShots([]);
    setComposed(null);
    setStep("camera");
  }

  return (
    <div className="min-h-full flex flex-col">
      <StepHeader
        title="Here's the strip"
        subtitle={
          canRetake
            ? `Looks good? You have ${retakesLeft} retake${retakesLeft === 1 ? "" : "s"} left.`
            : "Last shot — no more retakes left."
        }
      />
      <div className="px-10 pb-10 flex-1 flex items-stretch gap-8">
        <div className="flex-1 flex items-center justify-center">
          {busy && (
            <p className="text-muted">Composing your photo…</p>
          )}
          {!busy && composedDataUrl && (
            <img
              src={composedDataUrl}
              alt="Composed result"
              className="max-h-[70vh] max-w-full rounded-lg shadow-lift fade-in"
            />
          )}
        </div>
        <aside className="w-72 flex flex-col gap-4">
          <div className="card p-5">
            <p className="text-xs uppercase tracking-widest text-muted mb-2">
              Retakes
            </p>
            <p className="font-serif text-3xl">
              {retakesLeft}
              <span className="text-base text-muted"> / {MAX_RETAKES}</span>
            </p>
            <p className="text-xs text-muted mt-1">
              Two retakes per session, total.
            </p>
          </div>
          <button
            className="btn-secondary"
            onClick={handleRetake}
            disabled={!canRetake || busy}
          >
            Retake all
          </button>
          <button
            className="btn-primary"
            onClick={() => setStep("filter")}
            disabled={busy || !composedDataUrl}
          >
            Continue →
          </button>
        </aside>
      </div>
    </div>
  );
}
