import { LAYOUTS } from "../layouts";
import { useSession } from "../state/session";
import { StepHeader } from "./StepHeader";

export function LayoutPicker() {
  const { layoutId, setLayoutId, setStep } = useSession((s) => ({
    layoutId: s.layoutId,
    setLayoutId: s.setLayoutId,
    setStep: s.setStep,
  }));

  return (
    <div className="min-h-full flex flex-col">
      <StepHeader
        title="Choose a layout"
        subtitle="Each one decides how many photos you'll take."
        onBack={() => setStep("welcome")}
      />
      <div className="px-10 pb-10 grid grid-cols-2 sm:grid-cols-3 gap-5 flex-1">
        {LAYOUTS.map((l) => {
          const selected = layoutId === l.id;
          return (
            <button
              key={l.id}
              onClick={() => setLayoutId(l.id)}
              className={
                "text-left p-5 rounded-2xl transition-all duration-200 ease-cinema border " +
                (selected
                  ? "border-accent bg-white shadow-lift"
                  : "border-hairline bg-white/60 hover:bg-white shadow-soft")
              }
            >
              <LayoutPreview id={l.id} />
              <div className="mt-4 flex items-baseline justify-between">
                <span className="font-serif text-xl">{l.name}</span>
                <span className="text-xs uppercase tracking-widest text-muted">
                  {l.shots} {l.shots === 1 ? "shot" : "shots"}
                </span>
              </div>
              <p className="text-xs text-muted mt-1">{l.description}</p>
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
          Continue →
        </button>
      </div>
    </div>
  );
}

function LayoutPreview({ id }: { id: string }) {
  switch (id) {
    case "classic-strip":
      return (
        <div className="bg-white border border-hairline aspect-[1/3] mx-auto w-12 rounded-sm flex flex-col gap-[2px] p-[3px]">
          <div className="flex-1 bg-ink/10" />
          <div className="flex-1 bg-ink/10" />
          <div className="flex-1 bg-ink/10" />
          <div className="flex-1 bg-ink/10" />
        </div>
      );
    case "grid-2x2":
      return (
        <div className="bg-cream border border-hairline aspect-square mx-auto w-20 grid grid-cols-2 gap-1 p-1">
          <div className="bg-ink/10" />
          <div className="bg-ink/10" />
          <div className="bg-ink/10" />
          <div className="bg-ink/10" />
        </div>
      );
    case "polaroid":
      return (
        <div className="bg-white border border-hairline mx-auto w-20 aspect-[10/12] flex flex-col p-1.5 pb-3">
          <div className="flex-1 bg-ink/10" />
        </div>
      );
    case "film-strip":
      return (
        <div className="bg-ink mx-auto w-24 aspect-[8/3] flex items-center gap-1 px-1">
          <div className="flex-1 aspect-[4/3] bg-ink/40" />
          <div className="flex-1 aspect-[4/3] bg-ink/40" />
          <div className="flex-1 aspect-[4/3] bg-ink/40" />
        </div>
      );
    case "magazine":
      return (
        <div className="relative bg-ink/40 mx-auto w-16 aspect-[3/4] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-white/70" />
        </div>
      );
    case "comic":
      return (
        <div className="bg-cream border-[2px] border-ink mx-auto w-20 aspect-square grid grid-cols-2 gap-1 p-1">
          <div className="bg-ink/10 border-2 border-ink" />
          <div className="bg-ink/10 border-2 border-ink" />
          <div className="bg-ink/10 border-2 border-ink" />
          <div className="bg-ink/10 border-2 border-ink" />
        </div>
      );
    default:
      return null;
  }
}
