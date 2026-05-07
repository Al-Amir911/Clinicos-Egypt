"use client";

import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const today = new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <div className="hidden md:block text-sm font-medium text-slate-500">
          {today}
        </div>
        
        <div className="relative max-w-md w-full ml-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث برقم الهاتف أو الاسم..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pr-10 pl-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة مريض
        </Button>
      </div>
    </header>
  );
}
