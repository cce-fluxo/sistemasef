export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-3xl shadow-lg shadow-brand-500/30">
          🏆
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-foreground/60">{subtitle}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-black/5 bg-surface p-6 shadow-xl shadow-black/5 dark:border-white/5">
        {children}
      </div>
    </>
  );
}
