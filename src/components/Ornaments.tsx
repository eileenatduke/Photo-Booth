type DividerProps = {
  glyph?: string;
  tone?: "ink" | "burnt" | "sage";
};

export function Divider({ glyph = "❋", tone = "burnt" }: DividerProps) {
  const color =
    tone === "burnt" ? "text-burnt" : tone === "sage" ? "text-sage-deep" : "text-ink";
  return (
    <div className="flex items-center gap-3 select-none">
      <span className="flex-1 h-px bg-hairline" />
      <span className={`text-lg ${color}`}>{glyph}</span>
      <span className="flex-1 h-px bg-hairline" />
    </div>
  );
}

type SealProps = {
  number?: number | string;
  label?: string;
};

export function Seal({ number, label }: SealProps) {
  return (
    <div className="relative inline-grid place-items-center w-24 h-24">
      <span className="absolute inset-0 rounded-full border border-burnt/60" />
      <span className="absolute inset-1.5 rounded-full border border-burnt/30" />
      {number !== undefined && (
        <span className="font-serif text-3xl text-burnt leading-none">
          {number}
        </span>
      )}
      {label && (
        <span className="absolute bottom-2 text-[8px] uppercase tracking-[0.32em] text-burnt">
          {label}
        </span>
      )}
    </div>
  );
}

export function MastheadRule() {
  return (
    <div className="space-y-[3px]">
      <div className="h-px bg-ink" />
      <div className="h-[2px] bg-ink" />
      <div className="h-px bg-ink" />
    </div>
  );
}

export function CornerFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative p-6">
      <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-ink" />
      <span className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-ink" />
      <span className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-ink" />
      <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-ink" />
      {children}
    </div>
  );
}

export function Sunburst({ size = 60 }: { size?: number }) {
  const rays = 16;
  const items = Array.from({ length: rays });
  return (
    <div
      className="relative inline-block"
      style={{ width: size, height: size }}
    >
      {items.map((_, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-1/2 bg-burnt origin-bottom"
          style={{
            width: 1.5,
            height: size / 2,
            transform: `translate(-50%, -100%) rotate(${(360 / rays) * i}deg)`,
            transformOrigin: "50% 100%",
          }}
        />
      ))}
      <span
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-burnt"
        style={{ width: size * 0.18, height: size * 0.18 }}
      />
    </div>
  );
}
