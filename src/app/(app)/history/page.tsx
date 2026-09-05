"use client";

import { History as HistoryIcon, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ActivityRow } from "@/components/history/activity-row";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CategoryFilter } from "@/components/ui/category-filter";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivities } from "@/hooks/use-activities";
import type { EmissionCategory } from "@/lib/validation";

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<EmissionCategory | null>(null);
  const { items, pagination, isLoading, error, refresh } = useActivities(page, category);

  function handleCategoryChange(next: EmissionCategory | null) {
    setCategory(next);
    setPage(1);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-brand-950">History</h1>
      <p className="mt-1 text-sm text-brand-700/70">Everything you&rsquo;ve logged.</p>

      <div className="mt-5">
        <CategoryFilter value={category} onChange={handleCategoryChange} />
      </div>

      <div className="mt-4">
        {error && <p className="text-sm text-red-600">{error}</p>}

        {isLoading ? (
          <Card>
            <div className="flex flex-col gap-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          </Card>
        ) : !items || items.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No activities yet"
            description={
              category
                ? "No activities logged in this category yet."
                : "Once you log an activity, it'll show up here."
            }
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
          <Card>
            <div>
              {items.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} onChanged={refresh} />
              ))}
            </div>
            {pagination && <PaginationControls pagination={pagination} onPageChange={setPage} />}
          </Card>
        )}
      </div>
    </div>
  );
}
