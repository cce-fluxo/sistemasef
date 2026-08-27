type TickerProps = {
  items: string[];
  bgClassName?: string;
  textClassName?: string;
};

export function Ticker({ items, bgClassName = "bg-brand-600", textClassName = "text-gold-400" }: TickerProps) {
  const doubled = [...items, ...items];

  return (
    <div className={`overflow-hidden whitespace-nowrap border-y-2 border-black/10 py-2.5 dark:border-white/10 ${bgClassName}`}>
      <div className="animate-ticker inline-flex">
        {doubled.map((item, i) => (
          <span key={i} className={`px-6 font-display text-xs font-bold tracking-wider uppercase ${textClassName}`}>
            {item} <span className="opacity-60">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
