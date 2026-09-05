import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { serializeUser } from "@/lib/auth/serialize-user";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) {
    redirect("/login");
  }

  return <AppShell user={serializeUser(user)}>{children}</AppShell>;
}
