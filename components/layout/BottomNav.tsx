"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Wallet, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "الرئيسية", href: "/", icon: LayoutDashboard },
  { name: "الجدول", href: "/calendar", icon: Calendar },
  { name: "المرضى", href: "/patients", icon: Users },
  { name: "الحسابات", href: "/finance", icon: Wallet },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50">
      <div className="flex items-center justify-around p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 min-w-[4.5rem] rounded-xl transition-colors",
                isActive
                  ? "text-primary bg-primary/5"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-6 h-6 mb-1", isActive && "fill-primary/20")} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
