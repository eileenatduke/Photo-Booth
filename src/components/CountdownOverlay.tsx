type Props = {
  value: number | "flash" | null;
};

export function CountdownOverlay({ value }: Props) {
  if (value === null) return null;
  if (value === "flash") {
    return (
      <div className="absolute inset-0 bg-white animate-[flash_280ms_ease-out_forwards] pointer-events-none" />
    );
  }
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        key={value}
        className="font-serif text-white text-[20rem] leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.4)] animate-[count_900ms_ease-out_forwards]"
      >
        {value}
      </div>
    </div>
  );
}
