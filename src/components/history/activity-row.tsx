"use client";

import { motion } from "framer-motion";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api/client";
import type { Activity } from "@/lib/api/types";
import { getSubtypeIcon, getSubtypeLabel } from "@/lib/category-meta";
import { formatFullDate } from "@/lib/format-date";

type Mode = "view" | "edit" | "confirm-delete";

export function ActivityRow({ activity, onChanged }: { activity: Activity; onChanged: () => void }) {
  const [mode, setMode] = useState<Mode>("view");
  const [quantity, setQuantity] = useState(String(activity.quantity));
  const [logDate, setLogDate] = useState(activity.logDate.slice(0, 10));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const Icon = getSubtypeIcon(activity.subtype);

  async function handleSave() {
    setError(null);
    setIsSaving(true);
    try {
      await apiFetch(`/activities/${activity.id}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity: Number(quantity), logDate }),
      });
      setMode("view");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save changes");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsSaving(true);
    try {
      await apiFetch(`/activities/${activity.id}`, { method: "DELETE" });
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete this entry");
      setIsSaving(false);
    }
  }

  if (mode === "edit") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col gap-2.5 border-b border-brand-100 py-3 last:border-0"
      >
        <p className="text-sm font-medium text-brand-900">{getSubtypeLabel(activity.subtype)}</p>
        <div className="flex gap-2">
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="h-10"
          />
          <Input
            type="date"
            value={logDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setLogDate(e.target.value)}
            className="h-10"
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} isLoading={isSaving} disabled={!quantity}>
            <Check className="size-3.5" aria-hidden />
            Save
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setMode("view")} disabled={isSaving}>
            <X className="size-3.5" aria-hidden />
            Cancel
          </Button>
        </div>
      </motion.div>
    );
  }

  if (mode === "confirm-delete") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between gap-3 border-b border-brand-100 py-3 last:border-0"
      >
        <div>
          <p className="text-sm text-brand-800">Delete this entry?</p>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="danger" onClick={handleDelete} isLoading={isSaving}>
            Delete
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setMode("view")} disabled={isSaving}>
            Cancel
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div layout className="flex items-center gap-3 border-b border-brand-100 py-3 last:border-0">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
        <Icon className="size-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-brand-900">{getSubtypeLabel(activity.subtype)}</p>
        <p className="truncate text-xs text-brand-700/60">
          {formatFullDate(activity.logDate.slice(0, 10))} · {activity.quantity} {activity.unit}
        </p>
      </div>
      <p className="shrink-0 text-sm font-semibold text-brand-900">{activity.emissionsKg.toFixed(2)} kg</p>
      <div className="flex shrink-0 gap-0.5">
        <button
          type="button"
          onClick={() => setMode("edit")}
          className="rounded-lg p-2 text-brand-500 transition-colors hover:bg-brand-50 hover:text-brand-700"
          aria-label="Edit"
        >
          <Pencil className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setMode("confirm-delete")}
          className="rounded-lg p-2 text-brand-500 transition-colors hover:bg-red-50 hover:text-red-600"
          aria-label="Delete"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>
    </motion.div>
  );
}
