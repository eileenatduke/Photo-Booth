import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSession } from "../state/session";
import { BACKGROUND_PRESETS, renderPresetThumb } from "../lib/backgrounds";
import { StepHeader } from "./StepHeader";
import { Divider } from "./Ornaments";

export function BackgroundPicker() {
  const { bgMode, bgSource, setBgMode, setBgSource, setStep } = useSession(
    useShallow((s) => ({
      bgMode: s.bgMode,
      bgSource: s.bgSource,
      setBgMode: s.setBgMode,
      setBgSource: s.setBgSource,
      setStep: s.setStep,
    })),
  );

  const [uploadError, setUploadError] = useState<string | null>(null);

  const thumbs = useMemo(
    () =>
      BACKGROUND_PRESETS.map((p) => ({
        ...p,
        thumb: renderPresetThumb(p.id),
      })),
    [],
  );

  useEffect(() => {
    if (bgMode === "replace" && !bgSource) {
      setBgSource({ kind: "preset", id: BACKGROUND_PRESETS[0].id });
    }
  }, [bgMode, bgSource, setBgSource]);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("That doesn't look like an image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setUploadError(null);
      setBgSource({ kind: "custom", dataUrl: String(reader.result) });
    };
    reader.onerror = () => setUploadError("Failed to read the file.");
    reader.readAsDataURL(file);
  }

  const canContinue = bgMode === "real" || !!bgSource;

  return (
    <div className="min-h-full flex flex-col">
      <StepHeader
        title="The backdrop"
        subtitle="Keep the room you're in, or step somewhere else entirely."
        onBack={() => setStep("layout")}
        ornament="✦"
      />

      <div className="px-10 grid grid-cols-2 gap-4 my-4">
        <ModeCard
          active={bgMode === "real"}
          title="Use the room"
          tagline="Your real background, untouched."
          glyph="❖"
          onClick={() => setBgMode("real")}
        />
        <ModeCard
          active={bgMode === "replace"}
          title="Step elsewhere"
          tagline="A new backdrop, drawn around your silhouette."
          glyph="❀"
          onClick={() => setBgMode("replace")}
        />
      </div>

      {bgMode === "replace" && (
        <div className="px-10 pb-8 flex-1">
          <div className="my-6">
            <Divider glyph="❋" tone="sage" />
          </div>
          <p className="smallcaps text-center mb-4">Choose your scene</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {thumbs.map((p) => {
              const selected =
                bgSource?.kind === "preset" && bgSource.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setBgSource({ kind: "preset", id: p.id })}
                  className={
                    "group rounded-xl overflow-hidden border-2 transition-all bg-paper " +
                    (selected
                      ? "border-burnt shadow-lift"
                      : "border-hairline hover:border-hairline-soft hover:shadow-soft")
                  }
                >
                  <img
                    src={p.thumb}
                    alt={p.name}
                    className="w-full aspect-[3/2] object-cover"
                  />
                  <div className="text-xs py-2 px-3 text-left flex items-center justify-between">
                    <span className="font-serif text-base">{p.name}</span>
                    {selected && (
                      <span className="text-burnt text-xs">●</span>
                    )}
                  </div>
                </button>
              );
            })}
            <label
              className={
                "rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors p-3 " +
                (bgSource?.kind === "custom"
                  ? "border-burnt bg-paper"
                  : "border-hairline hover:border-burnt/40 bg-paper/60")
              }
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
              {bgSource?.kind === "custom" ? (
                <>
                  <img
                    src={bgSource.dataUrl}
                    alt="Custom"
                    className="w-full aspect-[3/2] object-cover rounded-md mb-2"
                  />
                  <span className="smallcaps">Replace upload</span>
                </>
              ) : (
                <>
                  <span className="ornament text-2xl mb-1">＋</span>
                  <span className="smallcaps">Upload your own</span>
                </>
              )}
            </label>
          </div>
          {uploadError && (
            <p className="text-burnt text-xs mt-3 italic">{uploadError}</p>
          )}
        </div>
      )}

      <div className="px-10 pb-10 flex justify-between mt-auto">
        <button className="btn-secondary" onClick={() => setStep("layout")}>
          ← Back
        </button>
        <button
          className="btn-primary"
          disabled={!canContinue}
          onClick={() => setStep("camera")}
        >
          To the camera →
        </button>
      </div>
    </div>
  );
}

function ModeCard({
  active,
  title,
  tagline,
  glyph,
  onClick,
}: {
  active: boolean;
  title: string;
  tagline: string;
  glyph: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "relative text-left px-6 py-5 rounded-2xl border-2 transition-all " +
        (active
          ? "border-burnt bg-paper shadow-lift"
          : "border-hairline bg-paper/70 hover:bg-paper")
      }
    >
      <span className="ornament text-2xl block mb-2">{glyph}</span>
      <p className="font-serif text-2xl">{title}</p>
      <p className="font-body italic text-ink-soft text-base mt-1">
        {tagline}
      </p>
      {active && (
        <span className="absolute top-3 right-4 stamp">Chosen</span>
      )}
    </button>
  );
}
