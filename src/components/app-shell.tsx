"use client";

import { Leaf, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import type { SessionUser } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "@/lib/nav-items";

export function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-brand-100 lg:bg-white">
        <div className="flex items-center gap-2 px-6 py-5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Leaf className="size-4" aria-hidden />
          </div>
          <span className="font-semibold text-brand-900">EcoTrack</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-brand-100 text-brand-800" : "text-brand-700/70 hover:bg-brand-50 hover:text-brand-800",
                )}
              >
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-brand-100 p-3">
          <div className="flex items-center justify-between rounded-xl px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-brand-900">{user.name}</p>
              <p className="truncate text-xs text-brand-700/60">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-brand-600 transition-colors hover:bg-brand-50"
              aria-label="Log out"
            >
              <LogOut className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-100 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Leaf className="size-3.5" aria-hidden />
          </div>
          <span className="font-semibold text-brand-900">EcoTrack</span>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-brand-600 transition-colors active:bg-brand-50"
          aria-label="Log out"
        >
          <LogOut className="size-4" aria-hidden />
        </button>
      </header>

      <main className="pb-20 lg:pb-8 lg:pl-60">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-brand-100 bg-white/95 backdrop-blur lg:hidden">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                active ? "text-brand-700" : "text-brand-700/50",
              )}
            >
              <item.icon className="size-5" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
