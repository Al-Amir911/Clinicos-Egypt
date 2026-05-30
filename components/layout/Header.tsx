"use client";

import { AddPatientModal } from "@/components/dashboard/AddPatientModal";

import { GlobalSearch } from "@/components/dashboard/GlobalSearch";

export function Header() {
  const today = new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-slate-100 px-3 md:px-5 py-1.5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-2 flex-1">
        <div className="hidden md:block text-xs font-semibold text-slate-500">
          {today}
        </div>
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2">
        <AddPatientModal />
      </div>
    </header>
  );
}
