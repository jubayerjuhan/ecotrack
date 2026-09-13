"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ApiError, apiFetch } from "@/lib/api/client";
import type { SessionUser } from "@/lib/api/types";
import { COUNTRIES } from "@/lib/countries";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await apiFetch<{ user: SessionUser }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password, countryCode }),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card sm:p-8">
      <h1 className="text-xl font-semibold text-brand-950">Create your account</h1>
      <p className="mt-1 text-sm text-brand-700/70">Start tracking your carbon footprint today.</p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <Field label="Name" htmlFor="name">
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field label="Country" htmlFor="country">
          <select
            id="country"
            required
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="h-12 w-full rounded-xl border border-brand-200 bg-white px-3.5 text-base text-brand-950 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-400"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              <AlertCircle className="size-4 shrink-0" aria-hidden />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-1">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-brand-700/70">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-700 underline-offset-2 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
