import { useSession } from "../state/session";
import type { Step } from "../types";
import { Rule } from "./Ornaments";

const ORDER: Step[] = ["layout", "camera", "review", "filter", "output"];

const LABEL: Record<Step, string> = {
  welcome: "Welcome",
  layout: "Layout",
  camera: "Sitting",
  capturing: "Sitting",
  review: "Review",
  filter: "Finish",
  output: "Print",
};

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
};

export function StepHeader({ title, subtitle, onBack }: Props) {
  const step = useSession((s) => s.step);
  const idx = ORDER.indexOf(step === "capturing" ? "camera" : step);

  return (
    <header className="px-2 pt-2 pb-4">
      <div className="flex items-center justify-between gap-4">
        <button
          className="btn-ghost text-xs disabled:opacity-0"
          onClick={onBack}
          disabled={!onBack}
        >
          &larr; Back
        </button>
        <div className="flex items-center gap-2">
          {ORDER.map((s, i) => (
            <span
              key={s}
              title={LABEL[s]}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === idx
                  ? "w-6 bg-champagne-deep"
                  : i < idx
                    ? "w-1.5 bg-champagne"
                    : "w-1.5 bg-hairline"
              }`}
            />
          ))}
        </div>
        <span className="smallcaps w-12 text-right">
          {idx + 1} / {ORDER.length}
        </span>
      </div>

      <div className="text-center mt-7">
        <h2 className="heading-display text-4xl sm:text-5xl">{title}</h2>
        {subtitle && (
          <p className="font-body text-lg text-ink-soft mt-2 max-w-xl mx-auto">
            {subtitle}
          </p>
        )}
        <Rule className="mt-5" />
      </div>
    </header>
  );
}
