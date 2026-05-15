"use client";

import { useState } from "react";
import { useScheduledAppointments, useSettings } from "@/hooks/useQueue";
import { Loader2, Calendar as CalendarIcon, Clock, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AddPatientModal } from "@/components/dashboard/AddPatientModal";

export default function CalendarPage() {
  const { data: appointments, isLoading: isLoadingApts } = useScheduledAppointments();
  const { data: settings, isLoading: isLoadingSettings } = useSettings();

  const [selectedDate, setSelectedDate] = useState("");

  const isLoading = isLoadingApts || isLoadingSettings;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const workingHoursStart = settings?.working_hours_start || "09:00";
  const workingHoursEnd = settings?.working_hours_end || "18:00";
  const slotDuration = settings?.slot_duration || 30;

  // Default to today if no date is selected
  const activeDate = selectedDate ? new Date(selectedDate) : new Date();
  activeDate.setHours(0, 0, 0, 0);

  // Generate slots for activeDate
  const [startHour, startMin] = workingHoursStart.split(":").map(Number);
  const [endHour, endMin] = workingHoursEnd.split(":").map(Number);
  
  const slots: Date[] = [];
  let currentHour = startHour;
  let currentMin = startMin;

  while (currentHour < endHour || (currentHour === endHour && currentMin <= endMin)) {
    const slotTime = new Date(activeDate);
    slotTime.setHours(currentHour, currentMin, 0, 0);
    slots.push(slotTime);
    currentMin += slotDuration;
    while (currentMin >= 60) {
      currentMin -= 60;
      currentHour += 1;
    }
  }

  // Map appointments to slots
  const slotMap = new Map<number, any>();
  
  appointments?.forEach((apt: any) => {
    if (!apt.scheduled_time) return;
    const aptDate = new Date(apt.scheduled_time);
    
    // Check if it's on activeDate
    if (
      aptDate.getFullYear() === activeDate.getFullYear() &&
      aptDate.getMonth() === activeDate.getMonth() &&
      aptDate.getDate() === activeDate.getDate()
    ) {
      const aptTime = aptDate.getTime();
      let matchedSlot: number | null = null;
      
      for (const slot of slots) {
        const slotTime = slot.getTime();
        const nextSlotTime = slotTime + (slotDuration * 60 * 1000);
        if (aptTime >= slotTime && aptTime < nextSlotTime) {
          matchedSlot = slotTime;
          break;
        }
      }
      
      if (matchedSlot) {
        slotMap.set(matchedSlot, apt);
      } else {
        // Fallback if appointment is outside normal hours
        const roundedTime = new Date(aptDate);
        roundedTime.setSeconds(0, 0);
        slotMap.set(roundedTime.getTime(), apt);
        // Also add this to slots if it doesn't exist
        if (!slots.some(s => s.getTime() === roundedTime.getTime())) {
          slots.push(roundedTime);
        }
      }
    }
  });

  // Sort slots just in case we added fallback outside hours
  slots.sort((a, b) => a.getTime() - b.getTime());

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">جدول الحجوزات</h1>
            <p className="text-slate-500 text-sm">عرض المواعيد المتاحة والمحجوزة</p>
          </div>
        </div>
        <div className="w-full sm:w-auto flex items-center gap-2">
          {selectedDate && (
            <button 
              onClick={() => setSelectedDate("")}
              className="text-xs text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
            >
              العودة لليوم
            </button>
          )}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-48 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right"
            dir="rtl"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b pb-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          {activeDate.toLocaleDateString("ar-EG", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h2>
        
        <div className="flex flex-col gap-3">
          {slots.map((slot) => {
            const apt = slotMap.get(slot.getTime());
            const timeStr = slot.toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' });
            // Format to local datetime-local
            const offset = slot.getTimezoneOffset() * 60000;
            const isoString = new Date(slot.getTime() - offset).toISOString().slice(0, 16);

            if (apt) {
              return (
                <div key={slot.getTime()} className="flex items-stretch border rounded-lg bg-white overflow-hidden shadow-sm h-20">
                  <div className="w-24 bg-primary/5 flex items-center justify-center font-bold text-primary border-l border-primary/10">
                    {timeStr}
                  </div>
                  <div className="p-3 flex-1 flex justify-between items-center">
                     <div>
                        <div className="font-semibold text-slate-900">{apt.patient.name}</div>
                        <div className="text-sm text-slate-500">{apt.patient.phone_number}</div>
                     </div>
                     <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          apt.visit_type === 'consultation' 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {apt.visit_type === 'consultation' ? 'كشف جديد' : 'إعادة'}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          apt.status === 'completed' 
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {apt.status === 'completed' ? 'مكتمل' : 'قيد الانتظار'}
                        </span>
                      </div>
                  </div>
                </div>
              );
            }

            return (
              <AddPatientModal
                key={slot.getTime()}
                defaultScheduledTime={isoString}
                trigger={
                  <button className="flex items-stretch border border-dashed border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 overflow-hidden transition-all text-right w-full group h-20">
                    <div className="w-24 bg-slate-100/50 flex items-center justify-center font-medium text-slate-500 border-l border-slate-200">
                      {timeStr}
                    </div>
                    <div className="p-4 flex-1 flex items-center text-slate-400 group-hover:text-primary transition-colors">
                      <Plus className="w-5 h-5 ml-2" />
                      إضافة حجز في هذا الموعد
                    </div>
                  </button>
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
