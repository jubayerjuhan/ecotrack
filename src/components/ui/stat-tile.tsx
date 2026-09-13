import type { LucideIcon } from "lucide-react";

export function StatTile({
  icon: Icon,
  label,
  value,
  suffix,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
        <Icon className="size-5" aria-hidden />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-brand-700/60">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold text-brand-950">
          {value}
          {suffix && <span className="ml-1 text-sm font-medium text-brand-700/60">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}
