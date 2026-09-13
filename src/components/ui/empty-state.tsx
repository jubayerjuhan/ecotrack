import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        <Icon className="size-6" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-brand-900">{title}</p>
        <p className="max-w-xs text-sm text-brand-700/70">{description}</p>
      </div>
      {action}
    </div>
  );
}
