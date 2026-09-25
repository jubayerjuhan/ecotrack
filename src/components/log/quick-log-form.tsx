"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Sparkles, Trash2, Wand2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api/client";
import type { Activity, EmissionFactor, ParsedActivity } from "@/lib/api/types";
import { getSubtypeIcon, getSubtypeLabel } from "@/lib/category-meta";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

type Draft = ParsedActivity & { id: string; logDate: string; unit: string };

export function QuickLogForm({
  factors,
  onLogged,
}: {
  factors: EmissionFactor[] | null;
  onLogged: (activities: Activity[]) => void;
}) {
  const [text, setText] = useState("");
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function unitFor(category: string, subtype: string) {
    return factors?.find((f) => f.category === category && f.subtype === subtype)?.unit ?? "";
  }

  async function handleParse() {
    setError(null);
    setIsParsing(true);
    try {
      const res = await apiFetch<{ activities: ParsedActivity[] }>("/activities/parse", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      if (res.activities.length === 0) {
        setError('Couldn’t find an activity in that — try describing what you did, e.g. "drove 10km and had a chicken meal".');
        setDrafts(null);
        return;
      }
      setDrafts(
        res.activities.map((a) => ({
          ...a,
          id: crypto.randomUUID(),
          logDate: todayIso(),
          unit: unitFor(a.category, a.subtype),
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't parse that. Try again.");
    } finally {
      setIsParsing(false);
    }
  }

  function updateQuantity(id: string, quantity: number) {
    setDrafts((prev) => prev?.map((d) => (d.id === id ? { ...d, quantity } : d)) ?? null);
  }

  function removeDraft(id: string) {
    setDrafts((prev) => prev?.filter((d) => d.id !== id) ?? null);
  }

  async function handleSubmit() {
    if (!drafts || drafts.length === 0) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const created: Activity[] = [];
      for (const d of drafts) {
        const res = await apiFetch<{ activity: Activity }>("/activities", {
          method: "POST",
          body: JSON.stringify({ category: d.category, subtype: d.subtype, quantity: d.quantity, logDate: d.logDate }),
        });
        created.push(res.activity);
      }
      onLogged(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save one of those activities. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Try "drove 15km to work and had a chicken meal for lunch"'
          rows={3}
          className="w-full resize-none rounded-xl border border-brand-200 bg-white px-3.5 py-3 text-base text-brand-950 placeholder:text-brand-950/35 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-400"
        />
        <Button onClick={handleParse} isLoading={isParsing} disabled={!text.trim()}>
          <Wand2 className="size-4" aria-hidden />
          Parse with AI
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {error}
        </div>
      )}

      <AnimatePresence initial={false}>
        {drafts && drafts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3 overflow-hidden"
          >
            <p className="text-sm font-medium text-brand-800">Review before logging</p>
            {drafts.map((d) => {
              const Icon = getSubtypeIcon(d.subtype);
              return (
                <div key={d.id} className="flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-brand-900">
                    {getSubtypeLabel(d.subtype)}
                  </p>
                  <div className="w-20 shrink-0">
                    <Input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      value={d.quantity}
                      onChange={(e) => updateQuantity(d.id, Number(e.target.value))}
                      className="h-10 text-right"
                    />
                  </div>
                  <span className="shrink-0 text-xs text-brand-700/60">{d.unit}</span>
                  <button
                    type="button"
                    onClick={() => removeDraft(d.id)}
                    className="rounded-lg p-2 text-brand-500 transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              );
            })}
            <Button size="lg" onClick={handleSubmit} isLoading={isSubmitting} disabled={drafts.length === 0}>
              <Sparkles className="size-4" aria-hidden />
              Log {drafts.length} {drafts.length === 1 ? "activity" : "activities"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
