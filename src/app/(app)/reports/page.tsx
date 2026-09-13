"use client";

import { Cloud, Download, FileText } from "lucide-react";
import { useState } from "react";
import { CategoryBreakdownChart } from "@/components/dashboard/category-breakdown-chart";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PeriodToggle } from "@/components/ui/period-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { StatTile } from "@/components/ui/stat-tile";
import { useReportSummary } from "@/hooks/use-report-summary";
import type { Period } from "@/lib/date-range";
import { formatFullDate } from "@/lib/format-date";

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>("month");
  const { report, isLoading, error } = useReportSummary(period);

  const hasActivity = (report?.totalEmissionsKg ?? 0) > 0;
  const csvHref = `/api/v1/reports?period=${period}&format=csv`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-brand-950">Reports</h1>
          <p className="mt-1 text-sm text-brand-700/70">Export your footprint data.</p>
        </div>
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {error && <p className="text-sm text-red-600">{error}</p>}

        {isLoading ? (
          <>
            <Skeleton className="h-[84px]" />
            <Skeleton className="h-[220px]" />
          </>
        ) : !hasActivity ? (
          <EmptyState
            icon={FileText}
            title="Nothing to report yet"
            description="Log a few activities and your report will show up here, ready to export."
          />
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <StatTile
                  icon={Cloud}
                  label={period === "week" ? "Total this week" : "Total this month"}
                  value={report!.totalEmissionsKg.toFixed(1)}
                  suffix="kg CO2e"
                />
              </div>
              <a
                href={csvHref}
                download
                className="flex items-center justify-center gap-2 rounded-2xl border border-brand-200 bg-white px-5 py-3 text-sm font-medium text-brand-800 shadow-card transition-colors hover:bg-brand-50 sm:w-48"
              >
                <Download className="size-4" aria-hidden />
                Download CSV
              </a>
            </div>

            <Card>
              <p className="mb-1 text-sm font-medium text-brand-800">By category</p>
              <p className="mb-4 text-xs text-brand-700/60">
                {formatFullDate(report!.range.from.slice(0, 10))} – {formatFullDate(report!.range.to.slice(0, 10))}
              </p>
              <CategoryBreakdownChart data={report!.byCategory} />
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
