import { Leaf } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-sand-50 px-4 py-10 sm:py-16">
      <div className="mb-8 flex items-center gap-2 text-brand-800">
        <div className="flex size-9 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Leaf className="size-5" aria-hidden />
        </div>
        <span className="text-lg font-semibold tracking-tight">EcoTrack</span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
