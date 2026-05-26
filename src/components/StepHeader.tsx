import { useSession } from "../state/session";
import type { Step } from "../types";
import { MastheadRule } from "./Ornaments";

const ORDER: Step[] = [
  "layout",
  "background",
  "camera",
  "review",
  "filter",
  "output",
];

const LABEL: Record<Step, string> = {
  welcome: "Welcome",
  layout: "Layout",
  background: "Backdrop",
  camera: "Capture",
  capturing: "Capture",
  review: "Review",
  filter: "Develop",
  output: "Print",
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  ornament?: string;
};

export function StepHeader({ title, subtitle, onBack, ornament }: Props) {
  const step = useSession((s) => s.step);
  const idx = ORDER.indexOf(step === "capturing" ? "camera" : step);

  return (
    <header className="px-10 pt-8 pb-5">
      <MastheadRule />
      <div className="flex items-center justify-between py-3">
        <button
          className="text-[11px] uppercase tracking-[0.28em] text-muted hover:text-ink transition-colors disabled:opacity-0"
          onClick={onBack}
          disabled={!onBack}
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          {ORDER.map((s, i) => {
            const active = i <= idx;
            return (
              <div
                key={s}
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em]"
              >
                <span
                  className={
                    "font-serif text-xs " +
                    (active ? "text-burnt" : "text-hairline")
                  }
                >
                  {ROMAN[i]}
                </span>
                <span className={active ? "text-ink" : "text-hairline"}>
                  {LABEL[s]}
                </span>
                {i < ORDER.length - 1 && (
                  <span className="text-hairline mx-1">·</span>
                )}
              </div>
            );
          })}
        </div>
        <span className="text-[11px] uppercase tracking-[0.28em] text-muted">
          № {ROMAN[idx] || "—"}
        </span>
      </div>
      <MastheadRule />

      <div className="flex items-end justify-between mt-6 gap-6">
        <div>
          <h2 className="heading-display text-5xl">{title}</h2>
          {subtitle && (
            <p className="mt-2 font-body italic text-ink-soft text-lg max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
        {ornament && (
          <span className="ornament text-3xl select-none">{ornament}</span>
        )}
      </div>
    </header>
  );
}
