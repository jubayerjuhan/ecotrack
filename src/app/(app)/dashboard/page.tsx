"use client";

import { Cloud, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CategoryBreakdownChart } from "@/components/dashboard/category-breakdown-chart";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PeriodToggle } from "@/components/ui/period-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { StatTile } from "@/components/ui/stat-tile";
import { useDashboardSummary } from "@/hooks/use-dashboard-summary";
import type { Period } from "@/lib/date-range";

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("week");
  const { summary, isLoading, error } = useDashboardSummary(period);

  const hasActivity = (summary?.totalEmissionsKg ?? 0) > 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-brand-950">Dashboard</h1>
          <p className="mt-1 text-sm text-brand-700/70">Your footprint at a glance.</p>
        </div>
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {error && <p className="text-sm text-red-600">{error}</p>}

        {isLoading ? (
          <>
            <Skeleton className="h-[84px]" />
            <Skeleton className="h-[260px]" />
            <Skeleton className="h-[220px]" />
          </>
        ) : !hasActivity ? (
          <EmptyState
            icon={Cloud}
            title="No activities logged yet"
            description="Log a trip, a meal, or your electricity use to start seeing your footprint here."
            action={
              <Link href="/log">
                <Button>
                  <PlusCircle className="size-4" aria-hidden />
                  Log an activity
                </Button>
              </Link>
            }
          />
        ) : (
          <>
            <StatTile
              icon={Cloud}
              label={period === "week" ? "Total this week" : "Total this month"}
              value={summary!.totalEmissionsKg.toFixed(1)}
              suffix="kg CO2e"
            />

            <Card>
              <p className="mb-4 text-sm font-medium text-brand-800">Trend</p>
              <TrendChart data={summary!.trend} />
            </Card>

            <Card>
              <p className="mb-4 text-sm font-medium text-brand-800">By category</p>
              <CategoryBreakdownChart data={summary!.byCategory} />
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
