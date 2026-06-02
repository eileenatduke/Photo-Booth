import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { FILTERS, applyFilter } from "../filters";
import { compose } from "../lib/compose";
import { getLayout } from "../layouts";
import { useSession, STRIP_COLORS } from "../state/session";
import type { LayoutId } from "../types";
import { StepHeader } from "./StepHeader";

const CUTE_FONT = '"Bradley Hand", "Snell Roundhand", "Comic Sans MS", cursive';
const NOTE_LIMIT = 30;

// Only the white-bordered strip & polaroid layouts carry a caption and let the
// user pick a strip colour. Grid, film strip and comic are fixed designs.
const CUSTOMIZABLE_LAYOUTS: LayoutId[] = [
  "classic-strip",
  "three-strip",
  "polaroid",
];

export function FilterPicker() {
  const {
    shots,
    layoutId,
    filterId,
    setFilterId,
    note,
    setNote,
    stripColor,
    setStripColor,
    setFiltered,
    setStep,
  } = useSession(
    useShallow((s) => ({
      shots: s.shots,
      layoutId: s.layoutId,
      filterId: s.filterId,
      setFilterId: s.setFilterId,
      note: s.note,
      setNote: s.setNote,
      stripColor: s.stripColor,
      setStripColor: s.setStripColor,
      setFiltered: s.setFiltered,
      setStep: s.setStep,
    })),
  );

  const [livePreview, setLivePreview] = useState<string | null>(null);
  const seq = useRef(0);

  const customizable =
    !!layoutId && CUSTOMIZABLE_LAYOUTS.includes(layoutId);

  useEffect(() => {
    if (!layoutId || shots.length === 0) return;
    const id = ++seq.current;
    let cancelled = false;
    (async () => {
      // Apply the finish to the photos only, then lay them onto the
      // (unfiltered) coloured strip with the note.
      const finishedShots = await Promise.all(
        shots.map(async (s) => ({
          ...s,
          dataUrl: await applyFilter(s.dataUrl, filterId),
        })),
      );
      const composed = await compose(finishedShots, getLayout(layoutId), {
        note: customizable ? note : "",
        baseColor: customizable ? stripColor : "#FFFFFF",
      });
      if (!cancelled && seq.current === id) setLivePreview(composed);
    })();
    return () => {
      cancelled = true;
    };
  }, [shots, layoutId, note, stripColor, filterId, customizable]);

  function handleContinue() {
    setFiltered(livePreview);
    setStep("output");
  }

  return (
    <div className="flex-1 flex flex-col fade-in">
      <StepHeader
        title="Add a Finish"
        subtitle={
          customizable
            ? "Make it yours — a note, a colour, and a timeless tone."
            : "Choose a timeless tone for your photos."
        }
        onBack={() => setStep("review")}
      />

      <div className="flex-1 px-2 pb-8 flex flex-col lg:flex-row items-start gap-10 max-w-4xl mx-auto w-full">
        {/* The product: the finished strip, no frame, just a soft shadow */}
        <div className="flex-1 w-full flex items-start justify-center py-2">
          {livePreview ? (
            <img
              src={livePreview}
              alt="Your strip"
              className="max-h-[64vh] w-auto block rounded-[3px] shadow-lift fade-in"
            />
          ) : (
            <div className="w-40 h-72 bg-cream animate-pulse rounded-[3px]" />
          )}
        </div>

        <aside className="w-full lg:w-80 flex flex-col gap-6">
          {customizable && (
            <>
              {/* Note */}
              <div>
                <p className="smallcaps mb-2">Your note</p>
                <input
                  type="text"
                  value={note}
                  maxLength={NOTE_LIMIT}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="write something cute…"
                  style={{ fontFamily: CUTE_FONT }}
                  className="w-full px-4 py-3 text-2xl rounded-lg bg-paper border border-hairline
                             focus:border-champagne-deep focus:outline-none text-ink
                             placeholder:text-muted/60"
                />
                <p className="text-[11px] text-muted text-right mt-1">
                  {note.length}/{NOTE_LIMIT}
                </p>
              </div>

              {/* Strip colour */}
              <div>
                <p className="smallcaps mb-3">Strip colour</p>
                <div className="flex gap-3">
                  {STRIP_COLORS.map((c) => {
                    const selected = stripColor === c.value;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setStripColor(c.value)}
                        title={c.name}
                        className={`h-10 w-10 rounded-full border transition-all ${
                          selected
                            ? "ring-2 ring-ink ring-offset-2 ring-offset-porcelain border-ink/20"
                            : "border-hairline hover:border-ink/30"
                        }`}
                        style={{ backgroundColor: c.value }}
                      />
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Finish */}
          <div>
            <p className="smallcaps mb-3">Finish</p>
            <div className="flex flex-col gap-2">
              {FILTERS.map((f) => {
                const selected = filterId === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilterId(f.id)}
                    className={
                      "px-4 py-2.5 rounded-lg border text-left transition-all bg-paper " +
                      (selected
                        ? "border-champagne-deep ring-1 ring-champagne-deep"
                        : "border-hairline hover:border-champagne-deep")
                    }
                  >
                    <span className="font-serif text-lg text-ink">{f.name}</span>
                    <span className="placard ml-2">{f.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            className="btn-primary"
            disabled={!livePreview}
            onClick={handleContinue}
          >
            Continue
          </button>
        </aside>
      </div>
    </div>
  );
}
