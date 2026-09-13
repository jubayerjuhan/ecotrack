"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, type TooltipProps, XAxis, YAxis } from "recharts";
import { formatFullDate, formatShortDate } from "@/lib/format-date";

function TrendTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length || typeof label !== "string") return null;
  return (
    <div className="rounded-lg border border-brand-100 bg-white px-3 py-2 text-xs shadow-card">
      <p className="font-medium text-brand-900">{formatFullDate(label)}</p>
      <p className="text-brand-700/70">{(payload[0].value as number).toFixed(2)} kg CO2e</p>
    </div>
  );
}

export function TrendChart({ data }: { data: { date: string; emissionsKg: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#217664" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#217664" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickFormatter={formatShortDate}
          tick={{ fontSize: 11, fill: "#5f7d76" }}
          axisLine={false}
          tickLine={false}
          minTickGap={28}
        />
        <YAxis hide domain={[0, "auto"]} />
        <Tooltip content={<TrendTooltip />} cursor={{ stroke: "#c6e2da", strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="emissionsKg"
          stroke="#217664"
          strokeWidth={2}
          fill="url(#trendFill)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0, fill: "#217664" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
