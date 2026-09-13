"use client";

import { Cell, Pie, PieChart, Tooltip, type TooltipProps } from "recharts";
import { CATEGORY_META } from "@/lib/category-meta";
import { CATEGORY_COLORS } from "@/lib/chart-colors";
import type { EmissionCategory } from "@/lib/validation";

type Datum = { category: EmissionCategory; emissionsKg: number };

function CategoryTooltip({ active, payload, total }: TooltipProps<number, string> & { total: number }) {
  if (!active || !payload?.length) return null;
  const datum = payload[0].payload as Datum;
  const pct = total > 0 ? Math.round((datum.emissionsKg / total) * 100) : 0;
  return (
    <div className="rounded-lg border border-brand-100 bg-white px-3 py-2 text-xs shadow-card">
      <p className="font-medium text-brand-900">{CATEGORY_META[datum.category].label}</p>
      <p className="text-brand-700/70">
        {datum.emissionsKg.toFixed(2)} kg CO2e · {pct}%
      </p>
    </div>
  );
}

export function CategoryBreakdownChart({ data }: { data: Datum[] }) {
  const total = data.reduce((sum, d) => sum + d.emissionsKg, 0);

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative" style={{ width: 172, height: 172 }}>
        {/* Fixed-size PieChart, not ResponsiveContainer: inside this flex-row
            layout, ResponsiveContainer's ResizeObserver-driven measurement
            reads the wrong width on first paint (raced by the sibling list's
            layout), so it's given literal dimensions instead. margin is
            zeroed because Recharts' default chart margin otherwise offsets
            the pie's center away from the middle of this box. */}
        <PieChart width={172} height={172} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={data}
            dataKey="emissionsKg"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={78}
            paddingAngle={2}
            stroke="none"
            isAnimationActive={false}
          >
            {data.map((d) => (
              <Cell key={d.category} fill={CATEGORY_COLORS[d.category]} />
            ))}
          </Pie>
          <Tooltip content={<CategoryTooltip total={total} />} />
        </PieChart>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold text-brand-950">{total.toFixed(1)}</span>
          <span className="text-[11px] text-brand-700/60">kg CO2e</span>
        </div>
      </div>

      <ul className="w-full space-y-2.5">
        {data.map((d) => {
          const Icon = CATEGORY_META[d.category].icon;
          const pct = total > 0 ? Math.round((d.emissionsKg / total) * 100) : 0;
          return (
            <li key={d.category} className="flex items-center gap-2.5 text-sm">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[d.category] }}
                aria-hidden
              />
              <Icon className="size-3.5 shrink-0 text-brand-700/50" aria-hidden />
              <span className="flex-1 text-brand-800">{CATEGORY_META[d.category].label}</span>
              <span className="font-medium text-brand-900">{d.emissionsKg.toFixed(1)} kg</span>
              <span className="w-9 shrink-0 text-right text-xs text-brand-700/50">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
