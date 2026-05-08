"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Users, Search, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddPatientModal } from "@/components/dashboard/AddPatientModal";

function useAllPatients() {
  const supabase: any = createClient();

  return useQuery({
    queryKey: ["allPatients"],
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

      const { data, error } = await supabase
        .from("patients")
        .select("id, name, phone_number, national_id, created_at")
        .eq("clinic_id", clinic_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export default function PatientsPage() {
  const { data: patients = [], isLoading } = useAllPatients();
  const [filter, setFilter] = useState("");

  const filtered = patients.filter((p: any) =>
    p.name?.toLowerCase().includes(filter.toLowerCase()) ||
    p.phone_number?.includes(filter)
  );

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
          <Users className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">دليل المرضى</h1>
          <p className="text-slate-500 text-sm">عرض جميع المرضى المسجلين في العيادة ({patients.length})</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="فلتر بالاسم أو رقم الهاتف..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-lg pr-10 pl-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed border-2 shadow-none bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Users className="w-12 h-12 mb-4 text-slate-300" />
            <p>لا يوجد مرضى مطابقين</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50/50">
                <th className="text-right py-3 px-4 font-semibold text-slate-600">الاسم</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-600">رقم الهاتف</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-600 hidden sm:table-cell">الرقم القومي</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-600 hidden md:table-cell">تاريخ التسجيل</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-600">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((patient: any) => (
                <tr key={patient.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">{patient.name}</td>
                  <td className="py-3 px-4 text-slate-600" dir="ltr">{patient.phone_number}</td>
                  <td className="py-3 px-4 text-slate-600 hidden sm:table-cell" dir="ltr">{patient.national_id || "—"}</td>
                  <td className="py-3 px-4 text-slate-500 hidden md:table-cell">
                    {new Date(patient.created_at).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="py-3 px-4">
                    <AddPatientModal
                      defaultName={patient.name}
                      defaultPhone={patient.phone_number}
                      trigger={<Button size="sm" variant="outline" className="h-8">حجز</Button>}
                    />
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
