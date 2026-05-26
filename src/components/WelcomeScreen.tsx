import { useSession } from "../state/session";

export function WelcomeScreen() {
  const setStep = useSession((s) => s.setStep);
  return (
    <div className="relative grain min-h-full flex flex-col items-center justify-center px-8 text-center">
      <p className="uppercase tracking-[0.3em] text-xs text-muted mb-6">
        est. today · est. forever
      </p>
      <h1 className="heading-display text-6xl sm:text-7xl leading-none mb-6">
        The Photo Booth
      </h1>
      <p className="max-w-md text-muted leading-relaxed mb-10">
        Pick a layout, strike a pose. A countdown, a flash, a single take —
        like the booth at the corner store, no quarters required.
      </p>
      <button
        className="btn-primary text-base px-8 py-4"
        onClick={() => setStep("layout")}
      >
        Start a Session
      </button>
      <p className="mt-8 text-xs text-muted">
        Sessions are ephemeral. Nothing is saved or sent anywhere.
      </p>
    </div>
  );
}
