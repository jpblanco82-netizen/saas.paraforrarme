"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, LayoutDashboard, PlusCircle, CreditCard, LogOut, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/actions/auth";

export function DashboardNav({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Panel & ROI", icon: LayoutDashboard },
    { href: "/dashboard/create", label: "Nuevo Contenido", icon: PlusCircle },
    { href: "/dashboard/billing", label: "Suscripción & Muro", icon: CreditCard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <span>MultiContent<span className="text-blue-600">.AI</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-100 text-blue-600 dark:bg-slate-800 dark:text-blue-400"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="hidden text-xs text-slate-500 sm:inline-block">
              {userEmail}
            </span>
          )}
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit" className="text-slate-600 hover:text-red-600 gap-1.5">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
