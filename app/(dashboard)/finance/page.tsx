"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Wallet, Search, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PaymentRow {
  id: string;
  amount: number;
  method: string | null;
  created_at: string | null;
  appointment: {
    visit_type: string | null;
    patient: { name: string; phone_number: string };
  };
}

function useAllPayments(selectedDate: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["allPayments", selectedDate],
    queryFn: async (): Promise<PaymentRow[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single() as { data: { clinic_id: string | null } | null };

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
      return (data as unknown as PaymentRow[]) || [];
    },
  });
}

export default function FinancePage() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [filter, setFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState<"all" | "cash" | "instapay">("all");

  const { data: payments = [], isLoading } = useAllPayments(selectedDate);

  const filtered = payments.filter((p: any) => {
    const name = p.appointment?.patient?.name || "";
    return name.toLowerCase().includes(filter.toLowerCase());
  });

  const totalRevenue = filtered.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const cashTotal = filtered.filter((p: any) => p.method === "cash").reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const instapayTotal = filtered.filter((p: any) => p.method === "instapay").reduce((sum: number, p: any) => sum + Number(p.amount), 0);

  const displayPayments = filtered.filter((p: any) => {
    if (methodFilter === "all") return true;
    return p.method === methodFilter;
  });

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
          <h1 className="text-2xl font-bold text-slate-950">سجل الإيرادات والتحصيلات</h1>
          <p className="text-slate-800 text-sm font-medium">إدارة ومتابعة المبالغ المحصلة من الكشوفات وتصفيتها بنوع وسيلة الدفع</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-5 rounded-2xl shadow-lg border border-indigo-900/40 text-right relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-15 translate-y-4 translate-x-4">
            <Wallet className="w-32 h-32 text-white" />
          </div>
          <span className="text-sm font-black text-white block">إجمالي التحصيلات</span>
          <h4 className="text-3xl sm:text-4xl font-black mt-1 text-white drop-shadow-md">
            {totalRevenue.toLocaleString("ar-EG")} <span className="text-xs font-bold text-indigo-200">ج.م</span>
          </h4>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-300 shadow-sm text-right">
          <span className="text-xs font-black text-slate-850 block">الدفع النقدي (Cash)</span>
          <h4 className="text-2xl sm:text-3xl font-black text-slate-950 mt-2">
            {cashTotal.toLocaleString("ar-EG")} <span className="text-xs font-extrabold text-slate-800">ج.م</span>
          </h4>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-300 shadow-sm text-right">
          <span className="text-xs font-black text-slate-850 block">إنستاباي (InstaPay)</span>
          <h4 className="text-2xl sm:text-3xl font-black text-emerald-800 mt-2">
            {instapayTotal.toLocaleString("ar-EG")} <span className="text-xs font-extrabold text-slate-800">ج.م</span>
          </h4>
        </div>
      </div>

      {/* Filters & Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-300 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="فلتر بالاسم..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pr-10 pl-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right font-bold text-slate-950 placeholder:text-slate-500"
              dir="rtl"
            />
          </div>
          <div className="w-full sm:w-44 relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right font-bold text-slate-950"
              dir="rtl"
            />
          </div>
        </div>

        <div className="flex gap-1.5 bg-slate-200/60 p-1 rounded-xl w-full md:w-auto justify-center md:justify-start" dir="rtl">
          <button
            type="button"
            onClick={() => setMethodFilter("all")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              methodFilter === "all" ? "bg-white text-blue-900 border border-slate-200/50 shadow-sm" : "text-slate-800 hover:text-slate-950"
            }`}
          >
            الكل
          </button>
          <button
            type="button"
            onClick={() => setMethodFilter("cash")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              methodFilter === "cash" ? "bg-white text-blue-900 border border-slate-200/50 shadow-sm" : "text-slate-800 hover:text-slate-950"
            }`}
          >
            نقدي
          </button>
          <button
            type="button"
            onClick={() => setMethodFilter("instapay")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              methodFilter === "instapay" ? "bg-white text-blue-900 border border-slate-200/50 shadow-sm" : "text-slate-800 hover:text-slate-950"
            }`}
          >
            InstaPay
          </button>
        </div>
      </div>

      {/* Cards List */}
      {displayPayments.length === 0 ? (
        <Card className="border-dashed border-2 shadow-none bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Wallet className="w-12 h-12 mb-4 text-slate-400" />
            <p className="font-bold text-slate-800">لا توجد معاملات مالية مطابقة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 pr-1">تفاصيل فواتير اليوم:</h4>
          <div className="flex flex-col gap-2">
            {displayPayments.map((payment: any) => (
              <div 
                key={payment.id} 
                className="p-4 flex items-center justify-between bg-white border border-slate-350 shadow-sm hover:shadow-md hover:border-slate-450 transition-all"
              >
                {/* Right Side: Patient Name & Visit details */}
                <div className="text-right">
                  <h5 className="font-bold text-slate-950 text-sm sm:text-base">
                    {payment.appointment?.patient?.name || "—"}
                  </h5>
                  <p className="text-xs text-slate-805 mt-1.5 flex items-center gap-1.5 font-bold">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      payment.appointment?.visit_type === "consultation" 
                        ? "bg-blue-50 text-blue-900 border border-blue-200" 
                        : "bg-purple-50 text-purple-900 border border-purple-200"
                    }`}>
                      {payment.appointment?.visit_type === "consultation" ? "كشف جديد" : "إعادة"}
                    </span>
                    <span className="text-[11px] text-slate-700 font-bold">
                      {payment.created_at ? new Date(payment.created_at).toLocaleTimeString("ar-EG", {
                        hour: "2-digit",
                        minute: "2-digit"
                      }) : "—"}
                    </span>
                  </p>
                </div>

                {/* Left Side: Method badge & price */}
                <div className="flex items-center gap-3.5 text-left">
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                    payment.method === "instapay" 
                      ? "bg-emerald-50 text-emerald-950 border border-emerald-300" 
                      : "bg-slate-100 text-slate-900 border border-slate-300"
                  }`}>
                    {payment.method === "instapay" ? "InstaPay" : "نقدي"}
                  </span>
                  <span className="font-black text-slate-950 text-base sm:text-lg">
                    {Number(payment.amount).toLocaleString("ar-EG")} <span className="text-xs font-extrabold text-slate-800">ج.م</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
