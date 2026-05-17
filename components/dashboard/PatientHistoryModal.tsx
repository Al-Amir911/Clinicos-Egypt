"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Calendar, Loader2, ImageOff } from "lucide-react";

function usePatientHistory(patientId: string, enabled: boolean) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["patientHistory", patientId],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, prescription_url, visit_type, created_at, completed_at, price, status")
        .eq("patient_id", patientId)
        .not("prescription_url", "is", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

interface PatientHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: {
    id: string;
    name: string;
  };
}

export function PatientHistoryModal({ open, onOpenChange, patient }: PatientHistoryModalProps) {
  const { data: history = [], isLoading } = usePatientHistory(patient.id, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right pr-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            سجل الروشتات — {patient.name}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <ImageOff className="w-10 h-10 mb-3" />
              <p className="text-sm">لا توجد روشتات مسجلة لهذا المريض</p>
            </div>
          ) : (
            history.map((record) => {
              const date = new Date(record.completed_at || record.created_at);
              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer"
                  onClick={() => window.open(record.prescription_url, "_blank", "noopener,noreferrer")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {record.visit_type === "consultation" ? "كشف جديد" : "إعادة"}
                        {record.price ? ` — ${record.price} ج.م` : ""}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {date.toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-primary font-medium">عرض ←</span>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
