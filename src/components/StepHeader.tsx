import { useSession } from "../state/session";
import type { Step } from "../types";

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
  background: "Background",
  camera: "Camera",
  capturing: "Camera",
  review: "Review",
  filter: "Filter",
  output: "Send",
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
    <header className="px-10 pt-8 pb-4">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-muted mb-6">
        <button
          className="hover:text-ink transition-colors"
          onClick={onBack}
          disabled={!onBack}
        >
          {onBack ? "← Back" : ""}
        </button>
        <div className="flex items-center gap-2">
          {ORDER.map((s, i) => (
            <span
              key={s}
              className={
                i <= idx
                  ? "h-px w-8 bg-ink transition-all"
                  : "h-px w-8 bg-hairline transition-all"
              }
            />
          ))}
        </div>
        <span>{LABEL[step]}</span>
      </div>
      <h2 className="heading-display text-4xl">{title}</h2>
      {subtitle && <p className="text-muted mt-2">{subtitle}</p>}
    </header>
  );
}
