"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Wallet, Settings, LogOut, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, useProfile } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const navItems = [
  { name: "الرئيسية", href: "/", icon: LayoutDashboard, isReady: true },
  { name: "جدول الحجوزات", href: "/calendar", icon: Calendar, isReady: true },
  { name: "المرضى", href: "/patients", icon: Users, isReady: true },
  { name: "الحسابات", href: "/finance", icon: Wallet, isReady: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();

  return (
    <aside className="w-64 bg-white border-l border-slate-200 hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-primary">ClinicOS</h1>
        {isLoading ? (
          <Skeleton className="h-4 w-24 mt-2" />
        ) : (
          <p className="text-sm text-slate-500 mt-1">د. {profile?.full_name || "طبيب"}</p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href && item.isReady;
          
          if (!item.isReady) {
            return (
              <button
                key={item.name}
                onClick={() => toast.info("هذه الميزة قيد التطوير وستتوفر قريباً!")}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-50 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-2">
        <Link
          href="/settings"
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <Settings className="w-5 h-5" />
          الإعدادات
        </Link>
        <button
          onClick={() => signOut.mutate()}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
