"use client";

import { useProfile } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardGreeting() {
  const { data: profile, isLoading } = useProfile();

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-slate-900">لوحة التحكم</h1>
      {isLoading ? (
        <Skeleton className="h-4 w-48 mt-2" />
      ) : (
        <p className="text-sm text-slate-500 mt-1">
          مرحباً بك د. {profile?.full_name || "طبيب"}، إليك ملخص العيادة اليوم.
        </p>
      )}
    </div>
  );
}
