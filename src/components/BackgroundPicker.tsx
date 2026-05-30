import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSession } from "../state/session";
import { BACKGROUND_PRESETS, renderPresetThumb } from "../lib/backgrounds";
import { StepHeader } from "./StepHeader";

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
    <div className="flex-1 flex flex-col fade-in">
      <StepHeader
        title="Set the Scene"
        subtitle="Keep the room you're in, or step somewhere else entirely."
        onBack={() => setStep("layout")}
      />

      <div className="flex-1 px-2 pb-4">
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mb-2">
          <ModeCard
            active={bgMode === "real"}
            title="Use the Room"
            tagline="Your real background, untouched."
            onClick={() => setBgMode("real")}
          />
          <ModeCard
            active={bgMode === "replace"}
            title="Step Elsewhere"
            tagline="A new backdrop, drawn around your silhouette."
            onClick={() => setBgMode("replace")}
          />
        </div>

        {bgMode === "replace" && (
          <div className="max-w-3xl mx-auto mt-8">
            <p className="smallcaps text-center mb-5">Choose your scene</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-5">
              {thumbs.map((p) => {
                const selected =
                  bgSource?.kind === "preset" && bgSource.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setBgSource({ kind: "preset", id: p.id })}
                    className={`frame frame-hover ${
                      selected ? "frame-selected" : ""
                    }`}
                  >
                    <div className="matte p-1.5">
                      <img
                        src={p.thumb}
                        alt={p.name}
                        className="w-full aspect-[3/2] object-cover rounded-[1px]"
                      />
                      <p className="placard text-center mt-1.5">{p.name}</p>
                    </div>
                  </button>
                );
              })}

              <label
                className={`frame frame-hover cursor-pointer ${
                  bgSource?.kind === "custom" ? "frame-selected" : ""
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                />
                <div className="matte p-1.5">
                  {bgSource?.kind === "custom" ? (
                    <img
                      src={bgSource.dataUrl}
                      alt="Custom"
                      className="w-full aspect-[3/2] object-cover rounded-[1px]"
                    />
                  ) : (
                    <div className="w-full aspect-[3/2] grid place-items-center bg-cream rounded-[1px] text-muted text-2xl font-serif">
                      +
                    </div>
                  )}
                  <p className="placard text-center mt-1.5">
                    {bgSource?.kind === "custom" ? "Replace" : "Upload"}
                  </p>
                </div>
              </label>
            </div>
            {uploadError && (
              <p className="text-ink/70 text-xs mt-3 italic text-center">
                {uploadError}
              </p>
            )}
          </div>
        )}

        {bgMode === "real" && (
          <div className="max-w-md mx-auto text-center py-10">
            <p className="font-body text-xl text-ink-soft">
              Your natural surroundings will be kept exactly as they are.
            </p>
          </div>
        )}
      </div>

      <div className="px-2 pb-8 flex justify-center gap-3">
        <button className="btn-secondary" onClick={() => setStep("layout")}>
          &larr; Back
        </button>
        <button
          className="btn-primary"
          disabled={!canContinue}
          onClick={() => setStep("camera")}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function ModeCard({
  active,
  title,
  tagline,
  onClick,
}: {
  active: boolean;
  title: string;
  tagline: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative text-left px-6 py-5 rounded-lg border bg-paper transition-all ${
        active
          ? "border-champagne-deep shadow-soft ring-1 ring-champagne-deep"
          : "border-hairline hover:border-champagne-deep"
      }`}
    >
      <p className="font-serif text-2xl text-ink">{title}</p>
      <p className="font-body text-base text-ink-soft mt-1">{tagline}</p>
      {active && <span className="absolute top-3 right-4 stamp">Chosen</span>}
    </button>
  );
}
