"use client";

import { useScheduledAppointments } from "@/hooks/useQueue";
import { Loader2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CalendarPage() {
  const { data: appointments, isLoading } = useScheduledAppointments();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, any[]> = {};
  appointments?.forEach(apt => {
    const d = new Date(apt.scheduled_time);
    const dateStr = d.toLocaleDateString("ar-EG", {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    if (!grouped[dateStr]) grouped[dateStr] = [];
    grouped[dateStr].push(apt);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <CalendarIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">جدول الحجوزات</h1>
          <p className="text-slate-500 text-sm">عرض جميع الحجوزات المجدولة مسبقاً</p>
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <Card className="border-dashed border-2 shadow-none bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-slate-500">
            <CalendarIcon className="w-12 h-12 mb-4 text-slate-300" />
            <p>لا توجد حجوزات مجدولة حالياً</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, apts]) => (
            <div key={date} className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b pb-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                {date}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {apts.map((apt) => (
                  <Card key={apt.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-slate-900">{apt.patient.name}</div>
                        <div className="flex items-center text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                          <Clock className="w-3 h-3 ml-1" />
                          {new Date(apt.scheduled_time).toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="text-sm text-slate-500 mb-3">{apt.patient.phone_number}</div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-1 rounded-md font-medium ${
                          apt.visit_type === 'consultation' 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {apt.visit_type === 'consultation' ? 'كشف جديد' : 'إعادة'}
                        </span>
                        <span className={`px-2 py-1 rounded-md font-medium ${
                          apt.status === 'completed' 
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {apt.status === 'completed' ? 'مكتمل' : 'قيد الانتظار'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
