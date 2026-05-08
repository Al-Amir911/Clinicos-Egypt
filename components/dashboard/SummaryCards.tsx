"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Banknote } from "lucide-react";
import { useDailyStats } from "@/hooks/useQueue";
import { Skeleton } from "@/components/ui/skeleton";

export function SummaryCards() {
  const { data: stats, isLoading } = useDailyStats();

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">
            إجمالي مرضى اليوم
          </CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-slate-900">{stats?.totalPatients || 0}</div>
          )}
          <p className="text-xs text-slate-500 mt-1">
            كافة حجوزات اليوم
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">
            في الانتظار حالياً
          </CardTitle>
          <Clock className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-12 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-slate-900">{stats?.waitingPatients || 0}</div>
          )}
          <p className="text-xs text-slate-500 mt-1">
            في طابور العيادة
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">
            الإيرادات اليومية
          </CardTitle>
          <Banknote className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-32 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-slate-900">{stats?.totalRevenue.toLocaleString()} ج.م</div>
          )}
          <p className="text-xs text-slate-500 mt-1 flex justify-between">
            <span>نقدي: {stats?.cashRevenue.toLocaleString() || 0}</span>
            <span>إنستاباي: {stats?.instapayRevenue.toLocaleString() || 0}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
