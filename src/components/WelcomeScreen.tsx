import { useSession } from "../state/session";
import { Divider, Sunburst, MastheadRule } from "./Ornaments";

export function WelcomeScreen() {
  const setStep = useSession((s) => s.setStep);
  return (
    <div className="relative grain min-h-full flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.32em] text-muted mb-4">
          <span>EST. TODAY</span>
          <span>VOL. I · № 1</span>
          <span>FOR ONE NIGHT ONLY</span>
        </div>
        <MastheadRule />

        <div className="py-10 flex flex-col items-center">
          <Sunburst size={56} />
          <p className="smallcaps mt-6">presenting</p>
          <h1 className="heading-display text-7xl sm:text-[8rem] mt-3">
            The Photo
            <br />
            <span className="heading-script">Booth</span>
          </h1>
          <p className="font-body italic text-xl text-ink-soft mt-5">
            — a single sitting, four photographs, sent by way of paper or pixel —
          </p>
        </div>

        <MastheadRule />

        <div className="grid grid-cols-3 gap-6 py-8 text-left">
          <Feature glyph="❋" title="Choose">
            From six classic layouts — strips, polaroids, magazine plates.
          </Feature>
          <Feature glyph="✦" title="Pose">
            Mind the countdown. The flash will signal the moment.
          </Feature>
          <Feature glyph="❀" title="Send">
            Save the image, or scan the cipher to reach your telephone.
          </Feature>
        </div>

        <MastheadRule />

        <div className="mt-10 flex flex-col items-center gap-5">
          <button
            className="btn-primary text-base px-10 py-4 tracking-[0.18em]"
            onClick={() => setStep("layout")}
          >
            Begin a sitting
          </button>
          <Divider glyph="✦" />
          <p className="text-xs text-muted italic">
            Each session is fleeting. Nothing saved unless you say so.
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({
  glyph,
  title,
  children,
}: {
  glyph: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-2">
      <span className="ornament text-2xl block mb-2">{glyph}</span>
      <p className="smallcaps mb-1">{title}</p>
      <p className="font-body text-base italic text-ink-soft leading-snug">
        {children}
      </p>
    </div>
  );
}
