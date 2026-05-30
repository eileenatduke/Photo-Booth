import { useShallow } from "zustand/react/shallow";
import { LAYOUTS } from "../layouts";
import { useSession } from "../state/session";
import { StepHeader } from "./StepHeader";
import { CornerScrolls } from "./Ornaments";

export function LayoutPicker() {
  const { layoutId, setLayoutId, setStep } = useSession(
    useShallow((s) => ({
      layoutId: s.layoutId,
      setLayoutId: s.setLayoutId,
      setStep: s.setStep,
    })),
  );

  return (
    <div className="flex-1 flex flex-col fade-in">
      <StepHeader
        title="Choose the Format"
        subtitle="Each plate decides the number of photographs and the shape they take."
        onBack={() => setStep("welcome")}
      />

      <div className="flex-1 px-2 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-7 max-w-3xl mx-auto">
          {LAYOUTS.map((l, idx) => {
            const active = layoutId === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setLayoutId(l.id)}
                className={`frame-bw frame-hover text-left shadow-soft ${
                  active ? "frame-bw-selected shadow-lift" : ""
                }`}
              >
                <CornerScrolls />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="smallcaps">Plate № {idx + 1}</span>
                    <span className="text-[10px] uppercase tracking-[0.24em] text-muted">
                      {l.shots} {l.shots === 1 ? "shot" : "shots"}
                    </span>
                  </div>
                  <div className="aspect-[4/3] mb-3 bg-cream grid place-items-center overflow-hidden">
                    <LayoutPreview id={l.id} />
                  </div>
                  <p className="font-serif text-xl leading-tight text-ink">
                    {l.name}
                  </p>
                  <p className="placard mt-0.5">{l.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-2 pb-8 flex justify-center">
        <button
          className="btn-primary"
          disabled={!layoutId}
          onClick={() => setStep("background")}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function LayoutPreview({ id }: { id: string }) {
  switch (id) {
    case "classic-strip":
      return (
        <div className="bg-paper border border-hairline aspect-[1/3] mx-auto w-12 rounded-sm flex flex-col gap-[2px] p-[3px]">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex-1 bg-ink/10" />
          ))}
        </div>
      );
    case "grid-2x2":
      return (
        <div className="bg-cream border border-hairline aspect-square mx-auto w-20 grid grid-cols-2 gap-1 p-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-ink/10" />
          ))}
        </div>
      );
    case "polaroid":
      return (
        <div className="bg-paper border border-hairline mx-auto w-20 aspect-[10/12] flex flex-col p-1.5 pb-3 shadow-sm">
          <div className="flex-1 bg-ink/10" />
        </div>
      );
    case "film-strip":
      return (
        <div className="bg-ink mx-auto w-28 aspect-[8/3] flex items-center gap-1 px-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 aspect-[4/3] bg-paper/25" />
          ))}
        </div>
      );
    case "magazine":
      return (
        <div className="relative bg-ink/40 mx-auto w-16 aspect-[3/4] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-paper/80" />
          <div className="absolute bottom-1 right-1 w-5 h-2 bg-paper/80" />
        </div>
      );
    case "comic":
      return (
        <div className="bg-cream border-2 border-ink mx-auto w-20 aspect-square grid grid-cols-2 gap-1 p-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-ink/10 border-2 border-ink" />
          ))}
        </div>
      );
    default:
      return null;
  }
}
