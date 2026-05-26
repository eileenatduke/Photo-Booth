type Props = {
  value: number | "flash" | null;
};

export function CountdownOverlay({ value }: Props) {
  if (value === null) return null;
  if (value === "flash") {
    return (
      <div className="absolute inset-0 bg-paper animate-[flash_280ms_ease-out_forwards] pointer-events-none" />
    );
  }
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative">
        <span
          className="absolute inset-0 -m-12 rounded-full border-2 border-burnt/60"
          aria-hidden
        />
        <span
          className="absolute inset-0 -m-8 rounded-full border border-burnt/40"
          aria-hidden
        />
        <div
          key={value}
          className="font-serif text-cream text-[18rem] leading-none drop-shadow-[0_6px_24px_rgba(0,0,0,0.5)] animate-[count_900ms_ease-out_forwards]"
        >
          {value}
        </div>
      </div>
    </div>
  );
}
