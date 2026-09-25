"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { GuidedLogForm } from "@/components/log/guided-log-form";
import { LoggedSuccess } from "@/components/log/logged-success";
import { QuickLogForm } from "@/components/log/quick-log-form";
import { useEmissionFactors } from "@/hooks/use-emission-factors";
import type { Activity } from "@/lib/api/types";
import { cn } from "@/lib/cn";

type Mode = "guided" | "quick";

export default function LogPage() {
  const [mode, setMode] = useState<Mode>("guided");
  const [loggedActivities, setLoggedActivities] = useState<Activity[] | null>(null);
  const { factors, isLoading, error: loadError } = useEmissionFactors();

  if (loggedActivities) {
    return <LoggedSuccess activities={loggedActivities} onLogAnother={() => setLoggedActivities(null)} />;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-brand-950">Log an activity</h1>
      <p className="mt-1 text-sm text-brand-700/70">Pick a category, or just tell us what you did.</p>

      <div className="mt-5 inline-flex rounded-xl bg-brand-100/60 p-1">
        <button
          type="button"
          onClick={() => setMode("guided")}
          className={cn(
            "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors duration-150",
            mode === "guided" ? "bg-white text-brand-800 shadow-sm" : "text-brand-700/60 hover:text-brand-800",
          )}
        >
          Guided
        </button>
        <button
          type="button"
          onClick={() => setMode("quick")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors duration-150",
            mode === "quick" ? "bg-white text-brand-800 shadow-sm" : "text-brand-700/60 hover:text-brand-800",
          )}
        >
          <Sparkles className="size-3.5" aria-hidden />
          Quick (AI)
        </button>
      </div>

      <div className="mt-6">
        {mode === "guided" ? (
          <GuidedLogForm
            factors={factors}
            isLoading={isLoading}
            loadError={loadError}
            onLogged={(activity) => setLoggedActivities([activity])}
          />
        ) : (
          <QuickLogForm factors={factors} onLogged={setLoggedActivities} />
        )}
      </div>
    </div>
  );
}
