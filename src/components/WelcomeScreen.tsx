import { useSession } from "../state/session";
import { Rule } from "./Ornaments";
import { DecalsBackdrop } from "./DecalsBackdrop";

export function WelcomeScreen() {
  const setStep = useSession((s) => s.setStep);
  return (
    // `container-type: size` turns this hero into a sizing context, so the
    // decals and the text below can be sized in container units (cqw/cqh) and
    // scale proportionally together on any screen — phone, resized window, or
    // full-screen desktop.
    <div
      className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-10 fade-in"
      style={{ containerType: "size" }}
    >
      <DecalsBackdrop />

      <div
        className="relative z-10 flex flex-col items-center w-full max-w-full"
        style={{ marginTop: "clamp(1.5rem, 7cqh, 5.5rem)" }}
      >
        <p
          className="smallcaps mb-6"
          style={{ fontSize: "clamp(0.6rem, 1.3cqw, 0.78rem)" }}
        >
          Portrait Studio
        </p>

        <h1
          className="heading-display mb-4 max-w-full"
          style={{ fontSize: "clamp(2rem, 8.6cqw, 5.6rem)" }}
        >
          The Photo Booth
        </h1>

        <p
          className="heading-script text-ink-soft mb-8 max-w-full"
          style={{ fontSize: "clamp(1.1rem, 2.9cqw, 1.9rem)" }}
        >
          timeless portraits, beautifully composed
        </p>

        <Rule className="mb-8" />

        <p
          className="font-body text-ink-soft max-w-[min(28rem,100%)] mb-10 leading-relaxed px-2"
          style={{ fontSize: "clamp(1rem, 2.3cqw, 1.4rem)" }}
        >
          Sit for a short series of portraits and take them home as a single,
          considered print.
        </p>

        <button
          onClick={() => setStep("layout")}
          className="btn-primary px-10 py-4"
          style={{ fontSize: "clamp(0.9rem, 1.7cqw, 1rem)" }}
        >
          Begin
        </button>
      </div>
    </div>
  );
}
