import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-bold tracking-tight", className)}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M12 2c.7 2.6 2.3 4.2 4.9 4.9-2.6.7-4.2 2.3-4.9 4.9-.7-2.6-2.3-4.2-4.9-4.9C9.7 6.2 11.3 4.6 12 2Zm5.8 9.4c.5 1.8 1.6 2.9 3.4 3.4-1.8.5-2.9 1.6-3.4 3.4-.5-1.8-1.6-2.9-3.4-3.4 1.8-.5 2.9-1.6 3.4-3.4Zm-11.6.9c.4 1.6 1.4 2.6 3 3-1.6.4-2.6 1.4-3 3-.4-1.6-1.4-2.6-3-3 1.6-.4 2.6-1.4 3-3Z" />
        </svg>
      </span>
      {!compact && <span className="text-lg">Talento</span>}
    </span>
  );
}

export function MatchRing({
  value,
  size = 96,
  label = "Match",
  tone = "primary",
}: {
  value: number;
  size?: number;
  label?: string;
  tone?: "primary" | "success" | "warning";
}) {
  const stroke = size >= 80 ? 9 : 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const color =
    tone === "success"
      ? "var(--color-success)"
      : tone === "warning"
        ? "var(--color-warning)"
        : "var(--color-primary)";

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${pct}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-none">
        <div>
          <div className="font-bold" style={{ fontSize: size / 4 }}>
            {pct}%
          </div>
          <div className="mt-1 text-[10px] font-medium text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}

export function StatTile({
  value,
  label,
  icon,
}: {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="surface flex items-center gap-3 p-3">
      {icon && (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <div className="text-lg font-bold leading-tight">{value}</div>
        <div className="truncate text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
  icon,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="surface flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
        {icon}
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
      {action}
    </div>
  );
}

export function AiBadge({ children = "AI" }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
        <path d="M12 2c.7 2.6 2.3 4.2 4.9 4.9-2.6.7-4.2 2.3-4.9 4.9-.7-2.6-2.3-4.2-4.9-4.9C9.7 6.2 11.3 4.6 12 2Z" />
      </svg>
      {children}
    </span>
  );
}
