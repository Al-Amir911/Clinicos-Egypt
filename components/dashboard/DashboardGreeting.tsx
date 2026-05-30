"use client";

import { useProfile } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardGreeting() {
  const { data: profile, isLoading } = useProfile();

  return (
    <div className="mb-2">
      <h1 className="text-xl font-bold text-slate-900">لوحة التحكم</h1>
      {isLoading ? (
        <Skeleton className="h-4 w-48 mt-1" />
      ) : (
        <p className="text-xs text-slate-500 mt-0.5">
          مرحباً بك د. {profile?.full_name || "طبيب"}، إليك ملخص العيادة اليوم.
        </p>
      )}
    </div>
  );
}
