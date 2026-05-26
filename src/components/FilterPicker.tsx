import { useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { FILTERS, applyFilter } from "../filters";
import { useSession } from "../state/session";
import { StepHeader } from "./StepHeader";
import type { FilterId } from "../types";

export function FilterPicker() {
  const {
    composedDataUrl,
    filterId,
    setFilterId,
    setFiltered,
    setStep,
  } = useSession(
    useShallow((s) => ({
      composedDataUrl: s.composedDataUrl,
      filterId: s.filterId,
      setFilterId: s.setFilterId,
      setFiltered: s.setFiltered,
      setStep: s.setStep,
    })),
  );

  const [previews, setPreviews] = useState<Record<FilterId, string>>(
    {} as Record<FilterId, string>,
  );
  const [livePreview, setLivePreview] = useState<string | null>(null);
  const seq = useRef(0);

  const thumbSource = useMemo(() => composedDataUrl, [composedDataUrl]);

  useEffect(() => {
    if (!thumbSource) return;
    let cancelled = false;
    (async () => {
      const next: Record<FilterId, string> = {} as Record<FilterId, string>;
      for (const f of FILTERS) {
        const url = await applyFilter(thumbSource, f.id);
        if (cancelled) return;
        next[f.id] = url;
      }
      if (!cancelled) setPreviews(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [thumbSource]);

  useEffect(() => {
    if (!composedDataUrl) return;
    const id = ++seq.current;
    applyFilter(composedDataUrl, filterId).then((url) => {
      if (seq.current === id) setLivePreview(url);
    });
  }, [filterId, composedDataUrl]);

  function handleContinue() {
    setFiltered(livePreview);
    setStep("output");
  }

  return (
    <div className="min-h-full flex flex-col">
      <StepHeader
        title="Pick a filter"
        subtitle="Switch as many times as you want."
        onBack={() => setStep("review")}
      />
      <div className="px-10 pb-10 flex-1 flex gap-8">
        <div className="flex-1 flex items-center justify-center">
          {livePreview && (
            <img
              src={livePreview}
              alt="Preview"
              className="max-h-[68vh] max-w-full rounded-lg shadow-lift fade-in"
            />
          )}
        </div>
        <aside className="w-72 flex flex-col gap-3">
          {FILTERS.map((f) => {
            const selected = filterId === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilterId(f.id)}
                className={
                  "flex items-center gap-3 p-2 rounded-xl border transition-all text-left " +
                  (selected
                    ? "border-accent bg-white shadow-lift"
                    : "border-hairline bg-white/60 hover:bg-white")
                }
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-hairline flex-shrink-0">
                  {previews[f.id] && (
                    <img
                      src={previews[f.id]}
                      alt={f.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-serif text-lg leading-tight">{f.name}</p>
                  <p className="text-xs text-muted truncate">
                    {f.description}
                  </p>
                </div>
              </button>
            );
          })}
          <button
            className="btn-primary mt-auto"
            disabled={!livePreview}
            onClick={handleContinue}
          >
            Continue →
          </button>
        </aside>
      </div>
    </div>
  );
}
