type TickerProps = {
  items: string[];
  bgClassName?: string;
  textClassName?: string;
};

export function Ticker({ items, bgClassName = "bg-brand-500", textClassName = "text-gold-400" }: TickerProps) {
  const doubled = [...items, ...items];

  return (
    <div
      className={`overflow-hidden border-y-2 border-black/20 py-2.5 whitespace-nowrap ${bgClassName}`}
      aria-hidden
    >
      <div className="animate-ticker inline-flex">
        {doubled.map((item, i) => (
          <span
            key={i}
            className={`px-6 font-heading text-[13px] font-bold tracking-[0.08em] uppercase ${textClassName}`}
          >
            {item} <span className="opacity-60">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
