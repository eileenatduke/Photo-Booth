import { useEffect, useState } from "react";

/**
 * Decorative backdrop for the welcome screen.
 *
 * A y2k scrapbook of analog ephemera — "Moments Captured" stamp, hibiscus,
 * license plate, mixtape, old TV, cat-eye shades, rotary dial, postcard, film
 * strip, ace of spades, a TV-headed figure, a love note, a lucky ticket and a
 * pushpin — scattered around the blank margins of the page, framing the centered
 * headline.
 *
 * Entrance: the page starts blank, then the pieces pop in one by one in a
 * clockwise sweep (starting with the Moments stamp, top-left), vanish one by one
 * in reverse order, and finally all reappear at once and stay put for the rest
 * of the visit.
 */

type DecalDef = {
  src: string;
  // Anchor point within the page, as percentages (x is the card's center).
  left: string;
  top: string;
  rotate: number;
  // Card width at desktop, in px (scaled down responsively).
  w: number;
  // When true, render the cut-out PNG directly (no white card frame).
  bare?: boolean;
};

const decal = (name: string) => `/decals/${name}.png`;

// Arranged around the perimeter so the centered text stays clear. The array
// order is also the pop-in order: a CLOCKWISE sweep starting from the Moments
// stamp (top-left) — across the top, down the right side, along the bottom
// right-to-left, then up the left side back toward the start.
const DECALS: DecalDef[] = [
  // top band, left -> right (gentle arch: center crests highest, ends dip lower)
  { src: decal("moments"), left: "8%", top: "16%", rotate: -7, w: 148, bare: true },
  { src: decal("flower"), left: "27%", top: "13%", rotate: -8, w: 140, bare: true },
  { src: decal("plate"), left: "46%", top: "9%", rotate: 5, w: 176 },
  { src: decal("cassette"), left: "64%", top: "10%", rotate: 8, w: 178 },
  { src: decal("pin"), left: "75%", top: "24%", rotate: 16, w: 58, bare: true },
  { src: decal("tv"), left: "88%", top: "14%", rotate: -5, w: 196, bare: true },
  // right column, top -> bottom
  { src: decal("postcard"), left: "93%", top: "34%", rotate: 6, w: 202 },
  { src: decal("filmstrip"), left: "96%", top: "62%", rotate: 9, w: 110 },
  { src: decal("acecard"), left: "93%", top: "84%", rotate: -8, w: 128 },
  // bottom, right -> left
  { src: decal("lucky"), left: "69%", top: "89%", rotate: -5, w: 152 },
  { src: decal("note"), left: "44%", top: "90%", rotate: 3, w: 176 },
  { src: decal("tvdress"), left: "17%", top: "77%", rotate: -4, w: 138, bare: true },
  // left column, bottom -> top (back toward Moments)
  { src: decal("phone"), left: "5%", top: "63%", rotate: 7, w: 138, bare: true },
  { src: decal("sunglasses"), left: "5%", top: "41%", rotate: -6, w: 160, bare: true },
];

const POP_STAGGER = 110; // delay between each piece popping in
const HOLD = 220; // brief pause once everything is in, before they leave
const VANISH_STAGGER = 80; // delay between each piece leaving (reverse order)
const PAUSE = 220; // blank beat before the final all-at-once reveal

type Vis = "hidden" | "shown";

export function DecalsBackdrop() {
  const [vis, setVis] = useState<Vis[]>(() => DECALS.map(() => "hidden"));

  useEffect(() => {
    // Respect reduced-motion: skip straight to the settled, all-shown state.
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setVis(DECALS.map(() => "shown"));
      return;
    }

    let cancelled = false;
    const timers: number[] = [];
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });
    const setOne = (i: number, v: Vis) =>
      setVis((prev) => {
        const next = prev.slice();
        next[i] = v;
        return next;
      });
    const setAll = (v: Vis) => setVis(DECALS.map(() => v));

    async function run() {
      // 1) pop in one by one, in order (Moments first)
      for (let i = 0; i < DECALS.length; i++) {
        if (cancelled) return;
        setOne(i, "shown");
        await sleep(POP_STAGGER);
      }
      if (cancelled) return;
      await sleep(HOLD);

      // 2) disappear one by one, in reverse order
      for (let i = DECALS.length - 1; i >= 0; i--) {
        if (cancelled) return;
        setOne(i, "hidden");
        await sleep(VANISH_STAGGER);
      }
      if (cancelled) return;
      await sleep(PAUSE);

      // 3) everything at once — the resting state for the rest of the visit
      if (cancelled) return;
      setAll("shown");
    }

    run();

    return () => {
      cancelled = true;
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-0">
      {DECALS.map((d, i) => {
        const shown = vis[i] === "shown";
        const pop = shown
          ? "translateY(0) scale(1)"
          : "translateY(24px) scale(0.5)";
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: d.left,
              top: d.top,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className={
                d.bare
                  ? "relative"
                  : "relative rounded-[4px] bg-white p-[2px] shadow-[0_14px_36px_rgba(28,27,25,0.22)] ring-1 ring-black/5"
              }
              style={{
                // Width is a fraction of the hero container's width (cqw), so
              // every piece scales proportionally on any screen size. The
              // container caps at the layout's max width, so on very wide
              // screens this settles at ~d.w px.
              width: `${(d.w / 10.6).toFixed(2)}cqw`,
                transform: `rotate(${d.rotate}deg) ${pop}`,
                opacity: shown ? 1 : 0,
                filter: d.bare
                  ? "saturate(1.12) contrast(1.02) drop-shadow(0 12px 22px rgba(28,27,25,0.28))"
                  : "saturate(1.12) contrast(1.02)",
                transition:
                  "transform 440ms cubic-bezier(0.34,1.56,0.64,1), opacity 300ms ease",
              }}
            >
              <img
                src={d.src}
                alt=""
                draggable={false}
                loading="eager"
                className={
                  d.bare
                    ? "block w-full h-auto"
                    : "block w-full h-auto rounded-[2px]"
                }
              />
              {/* faint glossy sticker highlight (cards only) */}
              {!d.bare && (
                <span className="pointer-events-none absolute inset-0 rounded-[4px] bg-gradient-to-br from-white/35 via-transparent to-transparent" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
