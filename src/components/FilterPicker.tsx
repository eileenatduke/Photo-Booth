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
        title="The darkroom"
        subtitle="Pick a treatment. Try a few — switching is free."
        onBack={() => setStep("review")}
        ornament="❀"
      />
      <div className="px-10 pb-10 flex-1 flex gap-8">
        <div className="flex-1 flex items-center justify-center">
          {livePreview && (
            <div className="relative bg-paper p-4 shadow-lift rotate-[0.5deg]">
              <img
                src={livePreview}
                alt="Preview"
                className="max-h-[64vh] max-w-full block fade-in"
              />
            </div>
          )}
        </div>
        <aside className="w-72 flex flex-col gap-3">
          <p className="smallcaps mb-1">Treatments</p>
          {FILTERS.map((f) => {
            const selected = filterId === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilterId(f.id)}
                className={
                  "flex items-center gap-3 p-2 rounded-xl border-2 transition-all text-left " +
                  (selected
                    ? "border-burnt bg-paper shadow-lift"
                    : "border-hairline bg-paper/70 hover:bg-paper")
                }
              >
                <div className="w-16 h-16 rounded overflow-hidden bg-hairline flex-shrink-0 border border-hairline">
                  {previews[f.id] && (
                    <img
                      src={previews[f.id]}
                      alt={f.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-lg leading-tight">{f.name}</p>
                  <p className="text-xs text-muted italic font-body truncate">
                    {f.description}
                  </p>
                </div>
                {selected && <span className="text-burnt text-sm">●</span>}
              </button>
            );
          })}
          <button
            className="btn-primary mt-auto"
            disabled={!livePreview}
            onClick={handleContinue}
          >
            Take it home →
          </button>
        </aside>
      </div>
    </div>
  );
}
