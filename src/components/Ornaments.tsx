type Props = {
  className?: string;
};

/** A quiet hairline divider with a small champagne diamond. */
export function Rule({ className }: Props) {
  return (
    <div
      className={`flex items-center justify-center gap-3 ${className ?? ""}`}
      aria-hidden
    >
      <span className="h-px w-12 bg-hairline" />
      <span className="h-1 w-1 rotate-45 bg-champagne-deep" />
      <span className="h-px w-12 bg-hairline" />
    </div>
  );
}

/** Fine black filigree scrolls for the four corners of a B&W frame.
    Place inside a relatively-positioned element. */
export function CornerScrolls() {
  const corners = [
    "top-0 left-0 rotate-0",
    "top-0 right-0 rotate-90",
    "bottom-0 right-0 rotate-180",
    "bottom-0 left-0 -rotate-90",
  ];
  return (
    <>
      {corners.map((c, i) => (
        <span
          key={i}
          className={`pointer-events-none absolute z-[2] text-ink ${c}`}
        >
          <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none" aria-hidden>
            <g
              stroke="currentColor"
              strokeWidth="0.9"
              strokeLinecap="round"
              fill="none"
            >
              <path d="M4 18 C4 9 9 4 18 4" />
              <path d="M18 4 c7 0 7 9 0 9 c-5 0 -5 -7 1.5 -7" />
              <path d="M4 18 c0 7 9 7 9 0 c0 -5 -7 -5 -7 1.5" />
              <path d="M12.5 12.5 c-3.5 -3 -9 -1 -9 3.5" />
              <path d="M12.5 12.5 c-3 -3.5 -1 -9 3.5 -9" />
            </g>
            <circle cx="18" cy="7.5" r="0.8" fill="currentColor" />
            <circle cx="7.5" cy="18" r="0.8" fill="currentColor" />
          </svg>
        </span>
      ))}
    </>
  );
}
