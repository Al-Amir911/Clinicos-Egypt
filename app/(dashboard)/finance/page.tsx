"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Wallet, Search, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function useAllPayments(selectedDate: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["allPayments", selectedDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      const clinic_id = profile?.clinic_id;
      if (!clinic_id) throw new Error("No clinic associated with user");

      let query = supabase
        .from("payments")
        .select(`
          id,
          amount,
          method,
          created_at,
          appointment:appointments!inner(
            visit_type,
            patient:patients!inner(name, phone_number)
          )
        `)
        .eq("clinic_id", clinic_id)
        .order("created_at", { ascending: false })
        .limit(500);

      if (selectedDate) {
        const start = new Date(selectedDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(selectedDate);
        end.setHours(23, 59, 59, 999);
        
        query = query
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });
}

export default function FinancePage() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [filter, setFilter] = useState("");

  const { data: payments = [], isLoading } = useAllPayments(selectedDate);

  const filtered = payments.filter((p: any) => {
    const name = p.appointment?.patient?.name || "";
    return name.toLowerCase().includes(filter.toLowerCase());
  });

  const totalRevenue = filtered.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const cashTotal = filtered.filter((p: any) => p.method === "cash").reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const instapayTotal = filtered.filter((p: any) => p.method === "instapay").reduce((sum: number, p: any) => sum + Number(p.amount), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <Wallet className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">السجل المالي</h1>
          <p className="text-slate-500 text-sm">عرض جميع المعاملات المالية ({payments.length} معاملة)</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-slate-500 mb-1">الإجمالي</p>
            <p className="text-2xl font-bold text-slate-900">{totalRevenue.toLocaleString("ar-EG")} ج.م</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-slate-500 mb-1">كاش</p>
            <p className="text-2xl font-bold text-emerald-600">{cashTotal.toLocaleString("ar-EG")} ج.م</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-slate-500 mb-1">إنستاباي</p>
            <p className="text-2xl font-bold text-blue-600">{instapayTotal.toLocaleString("ar-EG")} ج.م</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 max-w-2xl">
        <div className="relative w-full sm:w-2/3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="فلتر بالاسم..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pr-10 pl-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="w-full sm:w-1/3 relative">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right"
            dir="rtl"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card className="border-dashed border-2 shadow-none bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Wallet className="w-12 h-12 mb-4 text-slate-300" />
            <p>لا توجد معاملات مالية</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50/50">
                <th className="text-right py-3 px-4 font-semibold text-slate-600">المريض</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-600">المبلغ</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-600">طريقة الدفع</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-600 hidden sm:table-cell">نوع الكشف</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-600 hidden md:table-cell">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((payment: any) => (
                <tr key={payment.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {payment.appointment?.patient?.name || "—"}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {Number(payment.amount).toLocaleString("ar-EG")} ج.م
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={payment.method === "cash" ? "secondary" : "default"} className={payment.method === "cash" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"}>
                      {payment.method === "cash" ? "كاش" : "إنستاباي"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-600 hidden sm:table-cell">
                    {payment.appointment?.visit_type === "consultation" ? "كشف جديد" : "إعادة"}
                  </td>
                  <td className="py-3 px-4 text-slate-500 hidden md:table-cell">
                    {new Date(payment.created_at).toLocaleDateString("ar-EG", {
                      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
