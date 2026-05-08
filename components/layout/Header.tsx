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
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <div className="hidden md:block text-sm font-medium text-slate-500">
          {today}
        </div>
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-4">
        <AddPatientModal />
      </div>
    </header>
  );
}
