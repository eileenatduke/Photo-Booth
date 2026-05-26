import { useShallow } from "zustand/react/shallow";
import { LAYOUTS } from "../layouts";
import { useSession } from "../state/session";
import { StepHeader } from "./StepHeader";
import { Divider } from "./Ornaments";

export function LayoutPicker() {
  const { layoutId, setLayoutId, setStep } = useSession(
    useShallow((s) => ({
      layoutId: s.layoutId,
      setLayoutId: s.setLayoutId,
      setStep: s.setStep,
    })),
  );

  return (
    <div className="min-h-full flex flex-col">
      <StepHeader
        title="Choose the format"
        subtitle="Each plate decides the count of photographs and the shape they take."
        onBack={() => setStep("welcome")}
        ornament="❋"
      />
      <div className="px-10 pb-6">
        <Divider glyph="✦" />
      </div>
      <div className="px-10 pb-10 grid grid-cols-2 sm:grid-cols-3 gap-6 flex-1">
        {LAYOUTS.map((l, idx) => {
          const selected = layoutId === l.id;
          return (
            <button
              key={l.id}
              onClick={() => setLayoutId(l.id)}
              className={
                "relative text-left p-6 rounded-2xl transition-all duration-200 ease-cinema border-2 group " +
                (selected
                  ? "border-burnt bg-paper shadow-lift"
                  : "border-hairline bg-paper/70 hover:bg-paper hover:border-hairline shadow-soft")
              }
            >
              <span className="absolute top-3 left-4 smallcaps">
                Plate № {idx + 1}
              </span>
              <span
                className={
                  "absolute top-3 right-4 text-[10px] uppercase tracking-[0.28em] " +
                  (selected ? "text-burnt" : "text-muted")
                }
              >
                {l.shots} {l.shots === 1 ? "shot" : "shots"}
              </span>
              <div className="pt-7 pb-3">
                <LayoutPreview id={l.id} />
              </div>
              <div className="mt-3">
                <p className="font-serif text-2xl">{l.name}</p>
                <p className="font-body italic text-ink-soft text-base mt-1 leading-snug">
                  {l.description}
                </p>
              </div>
              {selected && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 stamp bg-paper">
                  Chosen
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="px-10 pb-10 flex justify-end">
        <button
          className="btn-primary"
          disabled={!layoutId}
          onClick={() => setStep("background")}
        >
          Onward to backdrop →
        </button>
      </div>
    </div>
  );
}

function LayoutPreview({ id }: { id: string }) {
  switch (id) {
    case "classic-strip":
      return (
        <div className="bg-paper border border-hairline aspect-[1/3] mx-auto w-14 rounded-sm flex flex-col gap-[2px] p-[3px]">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex-1 bg-ink/10" />
          ))}
        </div>
      );
    case "grid-2x2":
      return (
        <div className="bg-cream border border-hairline aspect-square mx-auto w-24 grid grid-cols-2 gap-1 p-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-ink/10" />
          ))}
        </div>
      );
    case "polaroid":
      return (
        <div className="bg-paper border border-hairline mx-auto w-24 aspect-[10/12] flex flex-col p-1.5 pb-3">
          <div className="flex-1 bg-ink/10" />
        </div>
      );
    case "film-strip":
      return (
        <div className="bg-ink mx-auto w-28 aspect-[8/3] flex items-center gap-1 px-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 aspect-[4/3] bg-ink/40" />
          ))}
        </div>
      );
    case "magazine":
      return (
        <div className="relative bg-ink/40 mx-auto w-20 aspect-[3/4] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-paper/80" />
          <div className="absolute bottom-1 right-1 w-5 h-2 bg-paper/80" />
        </div>
      );
    case "comic":
      return (
        <div className="bg-cream border-2 border-ink mx-auto w-24 aspect-square grid grid-cols-2 gap-1 p-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-ink/10 border-2 border-ink" />
          ))}
        </div>
      );
    default:
      return null;
  }
}
