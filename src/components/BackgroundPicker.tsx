import { useEffect, useMemo, useState } from "react";
import { useSession } from "../state/session";
import { BACKGROUND_PRESETS, renderPresetThumb } from "../lib/backgrounds";
import { StepHeader } from "./StepHeader";

export function BackgroundPicker() {
  const { bgMode, bgSource, setBgMode, setBgSource, setStep } = useSession(
    (s) => ({
      bgMode: s.bgMode,
      bgSource: s.bgSource,
      setBgMode: s.setBgMode,
      setBgSource: s.setBgSource,
      setStep: s.setStep,
    }),
  );

  const [uploadError, setUploadError] = useState<string | null>(null);

  const thumbs = useMemo(
    () => BACKGROUND_PRESETS.map((p) => ({ ...p, thumb: renderPresetThumb(p.id) })),
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
        title="Pick your backdrop"
        subtitle="Use the room around you, or swap it for something else."
        onBack={() => setStep("layout")}
      />
      <div className="px-10 flex gap-4 mb-6">
        <ModeChip
          active={bgMode === "real"}
          label="Use my real background"
          onClick={() => setBgMode("real")}
        />
        <ModeChip
          active={bgMode === "replace"}
          label="Replace background"
          onClick={() => setBgMode("replace")}
        />
      </div>

      {bgMode === "replace" && (
        <div className="px-10 pb-8 flex-1">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {thumbs.map((p) => {
              const selected =
                bgSource?.kind === "preset" && bgSource.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setBgSource({ kind: "preset", id: p.id })}
                  className={
                    "rounded-xl overflow-hidden border transition-all " +
                    (selected
                      ? "border-accent shadow-lift"
                      : "border-hairline hover:shadow-soft")
                  }
                >
                  <img
                    src={p.thumb}
                    alt={p.name}
                    className="w-full aspect-[3/2] object-cover"
                  />
                  <div className="text-xs py-2 px-3 bg-white text-left">
                    {p.name}
                  </div>
                </button>
              );
            })}
            <label
              className={
                "rounded-xl border border-dashed border-hairline flex flex-col items-center justify-center text-center text-xs px-3 cursor-pointer hover:border-accent transition-colors " +
                (bgSource?.kind === "custom"
                  ? "border-accent bg-white"
                  : "")
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
                  <span>Replace upload</span>
                </>
              ) : (
                <span className="py-6 text-muted">+ Upload your own</span>
              )}
            </label>
          </div>
          {uploadError && (
            <p className="text-accent text-xs mt-3">{uploadError}</p>
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
          Continue →
        </button>
      </div>
    </div>
  );
}

function ModeChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "px-5 py-2.5 rounded-full text-sm transition-all border " +
        (active
          ? "border-ink bg-ink text-cream"
          : "border-hairline bg-white/60 hover:bg-white")
      }
    >
      {label}
    </button>
  );
}
