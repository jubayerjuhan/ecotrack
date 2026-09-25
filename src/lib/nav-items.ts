import { FileText, History, LayoutDashboard, PlusCircle, Sparkles } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/log", label: "Log", icon: PlusCircle },
  { href: "/history", label: "History", icon: History },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/ask", label: "Ask AI", icon: Sparkles },
] as const;
