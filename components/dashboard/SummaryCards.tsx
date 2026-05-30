"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Banknote } from "lucide-react";
import { useDailyStats } from "@/hooks/useQueue";
import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";

export function SummaryCards({ isVertical = false }: { isVertical?: boolean }) {
  const { data: stats, isLoading } = useDailyStats();

  return (
    <div className={cn(
      "grid gap-3.5",
      isVertical ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3 mb-3"
    )}>
      <Card className="shadow-[0_4px_12px_rgba(0,0,0,0.015)] border border-slate-200/60 rounded-xl hover:shadow-[0_6px_16px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all duration-300 ease-out cursor-default">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 px-4.5">
          <CardTitle className="text-xs font-bold text-slate-500">
            إجمالي مرضى اليوم
          </CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent className="pb-3.5 px-4.5 pt-0">
          {isLoading ? (
            <Skeleton className="h-7 w-16 mb-1" />
          ) : (
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{stats?.totalPatients || 0}</div>
          )}
          <p className="text-[10px] font-medium text-slate-400 mt-1">
            كافة حجوزات اليوم
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-[0_4px_12px_rgba(0,0,0,0.015)] border border-slate-200/60 rounded-xl hover:shadow-[0_6px_16px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all duration-300 ease-out cursor-default">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 px-4.5">
          <CardTitle className="text-xs font-bold text-slate-500">
            في الانتظار حالياً
          </CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent className="pb-3.5 px-4.5 pt-0">
          {isLoading ? (
            <Skeleton className="h-7 w-12 mb-1" />
          ) : (
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{stats?.waitingPatients || 0}</div>
          )}
          <p className="text-[10px] font-medium text-slate-400 mt-1">
            في طابور العيادة
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-[0_4px_12px_rgba(0,0,0,0.015)] border border-slate-200/60 rounded-xl hover:shadow-[0_6px_16px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all duration-300 ease-out cursor-default">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 px-4.5">
          <CardTitle className="text-xs font-bold text-slate-500">
            الإيرادات اليومية
          </CardTitle>
          <Banknote className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent className="pb-3.5 px-4.5 pt-0">
          {isLoading ? (
            <Skeleton className="h-7 w-28 mb-1" />
          ) : (
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{stats?.totalRevenue.toLocaleString()} ج.م</div>
          )}
          <p className="text-[10px] font-medium text-slate-400 mt-1 flex justify-between">
            <span>نقدي: {stats?.cashRevenue.toLocaleString() || 0}</span>
            <span className="mx-1">|</span>
            <span>إنستاباي: {stats?.instapayRevenue.toLocaleString() || 0}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
