"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Repeat, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SelectTile } from "@/components/ui/select-tile";
import { Skeleton } from "@/components/ui/skeleton";
import { getSubtypesForCategory, useEmissionFactors } from "@/hooks/use-emission-factors";
import { apiFetch } from "@/lib/api/client";
import type { Activity } from "@/lib/api/types";
import { CATEGORY_META, getSubtypeIcon, getSubtypeLabel } from "@/lib/category-meta";
import { EMISSION_CATEGORIES, type EmissionCategory } from "@/lib/validation";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function LogPage() {
  const { factors, isLoading, error: loadError } = useEmissionFactors();

  const [category, setCategory] = useState<EmissionCategory | null>(null);
  const [subtype, setSubtype] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("");
  const [logDate, setLogDate] = useState(todayIso);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logged, setLogged] = useState<Activity | null>(null);

  const subtypes = useMemo(
    () => (factors && category ? getSubtypesForCategory(factors, category) : []),
    [factors, category],
  );
  const selectedFactor = subtypes.find((f) => f.subtype === subtype);

  function selectCategory(next: EmissionCategory) {
    setCategory(next);
    setSubtype(null);
    setSubmitError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!category || !subtype) return;

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await apiFetch<{ activity: Activity }>("/activities", {
        method: "POST",
        body: JSON.stringify({ category, subtype, quantity: Number(quantity), logDate }),
      });
      setLogged(res.activity);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Couldn't log that activity. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function logAnother() {
    setLogged(null);
    setSubtype(null);
    setQuantity("");
    setLogDate(todayIso());
  }

  if (logged) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <Sparkles className="size-7" aria-hidden />
          </div>
          <div>
            <p className="text-lg font-semibold text-brand-950">Logged!</p>
            <p className="mt-1 text-sm text-brand-700/70">
              {logged.quantity} {logged.unit} · {getSubtypeLabel(logged.subtype)} ·{" "}
              <span className="font-medium text-brand-800">{logged.emissionsKg.toFixed(2)} kg CO2e</span>
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="secondary" onClick={logAnother} className="w-full sm:w-auto">
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

  return (
    <div>
      <h1 className="text-xl font-semibold text-brand-950">Log an activity</h1>
      <p className="mt-1 text-sm text-brand-700/70">Pick a category to get started.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        <div>
          <p className="mb-2 text-sm font-medium text-brand-800">Category</p>
          <div className="grid grid-cols-3 gap-3">
            {EMISSION_CATEGORIES.map((c) => (
              <SelectTile
                key={c}
                icon={CATEGORY_META[c].icon}
                label={CATEGORY_META[c].label}
                active={category === c}
                onClick={() => selectCategory(c)}
              />
            ))}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {category && (
            <motion.div
              key="subtype"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="mb-2 text-sm font-medium text-brand-800">Type</p>
              {isLoading ? (
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-[84px]" />
                  ))}
                </div>
              ) : loadError ? (
                <p className="text-sm text-red-600">{loadError}</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {subtypes.map((f) => (
                    <SelectTile
                      key={f.subtype}
                      icon={getSubtypeIcon(f.subtype)}
                      label={getSubtypeLabel(f.subtype)}
                      active={subtype === f.subtype}
                      onClick={() => setSubtype(f.subtype)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {subtype && selectedFactor && (
            <motion.div
              key="details"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4 overflow-hidden"
            >
              <Field label={`Quantity (${selectedFactor.unit})`} htmlFor="quantity">
                <Input
                  id="quantity"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  required
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="text-lg"
                />
              </Field>
              <Field label="Date" htmlFor="logDate">
                <Input
                  id="logDate"
                  type="date"
                  required
                  max={todayIso()}
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                />
              </Field>

              {submitError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="size-4 shrink-0" aria-hidden />
                  {submitError}
                </div>
              )}

              <Button type="submit" size="lg" isLoading={isSubmitting} disabled={!quantity}>
                Log activity
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
