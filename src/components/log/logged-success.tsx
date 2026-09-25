"use client";

import { motion } from "framer-motion";
import { Repeat, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Activity } from "@/lib/api/types";
import { getSubtypeLabel } from "@/lib/category-meta";

export function LoggedSuccess({ activities, onLogAnother }: { activities: Activity[]; onLogAnother: () => void }) {
  const total = activities.reduce((sum, a) => sum + a.emissionsKg, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <Sparkles className="size-7" aria-hidden />
        </div>
        <div>
          <p className="text-lg font-semibold text-brand-950">
            {activities.length === 1 ? "Logged!" : `${activities.length} activities logged!`}
          </p>
          {activities.length === 1 ? (
            <p className="mt-1 text-sm text-brand-700/70">
              {activities[0].quantity} {activities[0].unit} · {getSubtypeLabel(activities[0].subtype)} ·{" "}
              <span className="font-medium text-brand-800">{activities[0].emissionsKg.toFixed(2)} kg CO2e</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-brand-700/70">
              Total <span className="font-medium text-brand-800">{total.toFixed(2)} kg CO2e</span>
            </p>
          )}
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Button variant="secondary" onClick={onLogAnother} className="w-full sm:w-auto">
            <Repeat className="size-4" aria-hidden />
            Log another
          </Button>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button className="w-full">View dashboard</Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
