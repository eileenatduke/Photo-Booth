import { useSession } from "../state/session";
import { Rule } from "./Ornaments";
import { DecalsBackdrop } from "./DecalsBackdrop";

export function WelcomeScreen() {
  const setStep = useSession((s) => s.setStep);
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-16 fade-in">
      <DecalsBackdrop />

      <div className="relative z-10 flex flex-col items-center mt-24 sm:mt-28">
        <p className="smallcaps mb-6">Portrait Studio</p>

        <h1 className="heading-display text-6xl sm:text-7xl md:text-8xl mb-4">
          The Photo Booth
        </h1>

        <p className="heading-script text-2xl sm:text-3xl text-ink-soft mb-8">
          timeless portraits, beautifully composed
        </p>

        <Rule className="mb-8" />

        <p className="font-body text-xl sm:text-2xl text-ink-soft max-w-md mb-10 leading-relaxed">
          Sit for a short series of portraits and take them home as a single,
          considered print.
        </p>

        <button
          onClick={() => setStep("layout")}
          className="btn-primary text-base px-10 py-4"
        >
          Begin
        </button>
      </div>
    </div>
  );
}
