"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Wallet, Settings, LogOut, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, useProfile } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const navItems = [
  { name: "الرئيسية", href: "/dashboard", icon: LayoutDashboard, isReady: true },
  { name: "جدول الحجوزات", href: "/calendar", icon: Calendar, isReady: true },
  { name: "المرضى", href: "/patients", icon: Users, isReady: true },
  { name: "الحسابات", href: "/finance", icon: Wallet, isReady: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();

  return (
    <aside className="w-64 bg-white border-l border-slate-200 hidden md:flex flex-col h-screen sticky top-0 shadow-[1px_0_10px_rgba(0,0,0,0.01)]">
      <div className="p-5 pb-4 border-b border-slate-100 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <h1 className="text-xl font-bold tracking-tight text-primary">ClinicOS</h1>
        </div>
        {isLoading ? (
          <Skeleton className="h-4 w-24 mt-1" />
        ) : (
          <p className="text-xs font-medium text-slate-500">د. {profile?.full_name || "طبيب"}</p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href && item.isReady;
          
          if (!item.isReady) {
            return (
              <button
                key={item.name}
                onClick={() => toast.info("هذه الميزة قيد التطوير وستتوفر قريباً!")}
                className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-50 transition-all duration-200"
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.name}
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                isActive
                  ? "bg-primary/8 text-primary font-semibold shadow-[0_1px_2px_rgba(15,108,189,0.05)]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-1">
        <Link
          href="/settings"
          className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
        >
          <Settings className="w-4.5 h-4.5" />
          الإعدادات
        </Link>
        <button
          onClick={() => signOut.mutate()}
          className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-4.5 h-4.5" />
          تسجيل الخروج
        </button>
      </div>

      {/* Signature pinned to absolute bottom */}
      <div className="px-4 pb-4 pt-2 mt-auto">
        <div className="text-xs text-slate-400/80 text-center select-none hover:text-primary transition-colors cursor-default border-t border-slate-100 pt-3" dir="ltr">
          Developed by <span className="font-semibold">Orion Systems</span>
        </div>
      </div>
    </aside>
  );
}

