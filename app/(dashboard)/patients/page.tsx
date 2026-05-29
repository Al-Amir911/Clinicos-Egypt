"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { 
  Users, 
  Search, 
  Loader2, 
  Pencil, 
  FileText, 
  Plus, 
  Check, 
  Trash2, 
  Camera, 
  ExternalLink, 
  Calendar, 
  ClipboardList 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddPatientModal } from "@/components/dashboard/AddPatientModal";
import { EditPatientModal } from "@/components/dashboard/EditPatientModal";
import { getOfflinePatientEdits } from "@/utils/offlineQueue";
import { useUploadPrescription } from "@/hooks/useQueue";
import { formatEgyptianPhoneForWhatsApp } from "@/utils/format";
import { toast } from "sonner";

interface PatientRow {
  id: string;
  name: string;
  phone_number: string;
  national_id: string | null;
  created_at: string | null;
}

interface VisitRow {
  id: string;
  status: string | null;
  visit_type: string | null;
  created_at: string | null;
  completed_at: string | null;
  price: number | null;
  prescription_url: string | null;
  symptoms: string | null;
  diagnosis: string | null;
  prescription_rx: any[] | null;
}

function useAllPatients(searchTerm: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const serverPatientsQuery = useQuery({
    queryKey: ["allPatientsServer", searchTerm],
    networkMode: "always",
    queryFn: async (): Promise<PatientRow[]> => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return queryClient.getQueryData(["allPatientsServer", searchTerm]) || [];
      }

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
        .from("patients")
        .select("id, name, phone_number, national_id, created_at")
        .eq("clinic_id", clinic_id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as PatientRow[]) || [];
    }
  });

  return useQuery({
    queryKey: ["allPatients", searchTerm],
    networkMode: "always",
    queryFn: async (): Promise<PatientRow[]> => {
      if (typeof navigator !== "undefined" && navigator.onLine) {
        await queryClient.ensureQueryData({
          queryKey: ["allPatientsServer", searchTerm],
          queryFn: serverPatientsQuery.refetch as any
        });
      }

      const serverPatients = queryClient.getQueryData<PatientRow[]>(["allPatientsServer", searchTerm]) || [];

      // Merge offline patient edits
      const offlinePatientEdits = getOfflinePatientEdits();
      const merged = serverPatients.map((patient) => {
        const edit = offlinePatientEdits.find((e) => e.id === patient.id);
        if (edit) {
          return {
            ...patient,
            name: edit.name,
            phone_number: edit.phone_number,
            national_id: edit.national_id !== undefined ? edit.national_id : patient.national_id,
          };
        }
        return patient;
      });

      return merged;
    }
  });
}

function usePatientVisits(patientId: string, enabled: boolean) {
  const supabase: any = createClient();
  return useQuery({
    queryKey: ["patientVisits", patientId],
    enabled: enabled && !!patientId,
    queryFn: async (): Promise<VisitRow[]> => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, status, visit_type, created_at, completed_at, price, prescription_url, symptoms, diagnosis, prescription_rx")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as any[]) || [];
    }
  });
}

function useSaveClinicalData() {
  const supabase: any = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      symptoms,
      diagnosis,
      prescription_rx
    }: {
      appointmentId: string;
      symptoms: string;
      diagnosis: string;
      prescription_rx: any[];
    }) => {
      const { data, error } = await supabase
        .from("appointments")
        .update({
          symptoms,
          diagnosis,
          prescription_rx
        })
        .eq("id", appointmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["patientVisits", data.patient_id] });
      toast.success("تم حفظ البيانات الطبية بنجاح");
    },
    onError: (error: any) => {
      console.error(error);
      toast.error("فشل في حفظ البيانات: " + error.message);
    }
  });
}

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

function PatientsWorkstation() {
  const [filter, setFilter] = useState("");
  const { data: patients = [], isLoading } = useAllPatients(filter);
  const [editPatient, setEditPatient] = useState<any>(null);
  
  const searchParams = useSearchParams();
  const urlPatientId = searchParams.get("patientId");
  const urlAppointmentId = searchParams.get("appointmentId");

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

  // Set selected patient (respecting URL search params)
  useEffect(() => {
    if (urlPatientId) {
      setSelectedPatientId(urlPatientId);
    } else if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId, urlPatientId]);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const { data: visits = [], isLoading: isLoadingVisits } = usePatientVisits(
    selectedPatient?.id || "", 
    !!selectedPatient?.id
  );

  const activeVisit = visits.find(v => v.id === selectedVisitId) || visits[0];

  // Set selected visit (respecting URL search params)
  useEffect(() => {
    if (urlAppointmentId) {
      setSelectedVisitId(urlAppointmentId);
    } else if (visits.length > 0) {
      setSelectedVisitId(visits[0].id);
    } else {
      setSelectedVisitId(null);
    }
  }, [visits, urlAppointmentId]);

  // Draft states for digital prescription
  const [draftSymptoms, setDraftSymptoms] = useState("");
  const [draftDiagnosis, setDraftDiagnosis] = useState("");
  const [draftRx, setDraftRx] = useState<Array<{ name: string; dose: string; duration: string }>>([]);
  const [prescriptionMode, setPrescriptionMode] = useState<"digital" | "paper">("digital");

  // Sync draft details with active visit
  useEffect(() => {
    if (activeVisit) {
      setDraftSymptoms(activeVisit.symptoms || "");
      setDraftDiagnosis(activeVisit.diagnosis || "");
      setDraftRx(Array.isArray(activeVisit.prescription_rx) ? activeVisit.prescription_rx : []);
      setPrescriptionMode(activeVisit.prescription_url ? "paper" : "digital");
    } else {
      setDraftSymptoms("");
      setDraftDiagnosis("");
      setDraftRx([]);
      setPrescriptionMode("digital");
    }
  }, [activeVisit]);

  // New medication form states
  const [newMedName, setNewMedName] = useState("");
  const [newMedDose, setNewMedDose] = useState("");
  const [newMedDuration, setNewMedDuration] = useState("");

  const handleAddMed = () => {
    if (!newMedName.trim()) return;
    setDraftRx([...draftRx, { 
      name: newMedName.trim(), 
      dose: newMedDose.trim(), 
      duration: newMedDuration.trim() 
    }]);
    setNewMedName("");
    setNewMedDose("");
    setNewMedDuration("");
  };

  const handleRemoveMed = (index: number) => {
    setDraftRx(draftRx.filter((_, idx) => idx !== index));
  };

  const { mutate: saveClinicalData, isPending: isSaving } = useSaveClinicalData();
  const { mutate: uploadPrescription, isPending: isUploading } = useUploadPrescription();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!activeVisit) return;
    saveClinicalData({
      appointmentId: activeVisit.id,
      symptoms: draftSymptoms,
      diagnosis: draftDiagnosis,
      prescription_rx: draftRx
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeVisit || !selectedPatient) return;
    
    uploadPrescription({
      file,
      appointmentId: activeVisit.id,
      patientId: selectedPatient.id
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["patientVisits", selectedPatient.id] });
        toast.success("تم رفع صورة الروشتة بنجاح");
      },
      onError: (err: any) => {
        toast.error("فشل في الرفع: " + err.message);
      }
    });
  };

  const handleSendWhatsAppPrescription = () => {
    if (!selectedPatient || !activeVisit) return;
    
    const formattedPhone = formatEgyptianPhoneForWhatsApp(selectedPatient.phone_number);
    if (!formattedPhone) {
      toast.error("رقم هاتف المريض غير صالح لإرسال واتساب");
      return;
    }

    let text = `*روشتة طبية رقمية* 💊\n`;
    text += `*المريض:* ${selectedPatient.name}\n`;
    if (draftDiagnosis) {
      text += `*التشخيص:* ${draftDiagnosis}\n`;
    }
    if (draftSymptoms) {
      text += `*الشكوى:* ${draftSymptoms}\n`;
    }
    
    if (draftRx.length > 0) {
      text += `\n*الأدوية الموصوفة (Rx):*\n`;
      draftRx.forEach((med, idx) => {
        text += `${idx + 1}. *${med.name}*\n`;
        if (med.dose) text += `   - الجرعة: ${med.dose}\n`;
        if (med.duration) text += `   - الفترة: ${med.duration}\n`;
      });
    }
    
    text += `\nمع تمنياتنا لك بالشفاء العاجل! ❤️`;
    
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-950 font-sans">عيادة الطبيب ودليل المرضى</h1>
          <p className="text-slate-800 text-sm font-medium">عرض ملفات المرضى، كتابة الروشتات الرقمية ومتابعة زياراتهم</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[500px]">
        
        {/* Left sidebar directory panel (1/3 Width) */}
        <div className="lg:col-span-4 bg-white border border-slate-300 rounded-2xl p-4 flex flex-col gap-4 shadow-sm h-[calc(100vh-220px)] min-h-[450px]">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="ابحث عن مريض بالاسم أو الهاتف..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-350 rounded-xl pr-10 pl-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right font-extrabold text-slate-950 placeholder:text-slate-500"
              dir="rtl"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1" dir="rtl">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-1">اضغط لاختيار مريض:</span>
            {patients.length === 0 ? (
              <div className="text-center py-12 text-slate-700 font-extrabold text-xs">
                لا يوجد مرضى مطابقين للبحث
              </div>
            ) : (
              patients.map((p) => {
                const isSelected = p.id === selectedPatient?.id;
                return (
                  <div 
                    key={p.id}
                    onClick={() => {
                      setSelectedPatientId(p.id);
                      setSelectedVisitId(null);
                    }}
                    className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? "bg-blue-50 border-blue-150 shadow-sm" 
                        : "bg-slate-50/60 border-transparent hover:bg-slate-100/80"
                    }`}
                  >
                    <div className="text-right">
                      <h5 className={`font-bold text-xs ${isSelected ? "text-blue-800" : "text-slate-800"}`}>
                        {p.name}
                      </h5>
                      <p className="text-[10px] text-slate-700 mt-1 font-bold">
                        الهاتف: {p.phone_number} • التسجيل: {p.created_at ? new Date(p.created_at).toLocaleDateString("ar-EG") : "—"}
                      </p>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? "bg-blue-600 animate-pulse" : "bg-slate-300"}`} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right medical workstation details panel (2/3 Width) */}
        <div className="lg:col-span-8 bg-white border border-slate-300 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-[calc(100vh-220px)] min-h-[450px] overflow-y-auto">
          {selectedPatient ? (
            <div className="space-y-5 flex-1 flex flex-col justify-between">
              
              {/* Header block with patient quick info & modals shortcuts */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4" dir="rtl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {selectedPatient.name.substring(0, 2)}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-950 text-sm sm:text-base">{selectedPatient.name}</h4>
                      <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">ملف طبي نشط</span>
                    </div>
                    <p className="text-xs text-slate-800 mt-0.5 font-bold">الهاتف: {selectedPatient.phone_number} • الرقم القومي: {selectedPatient.national_id || "—"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mr-auto ml-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-slate-600 border-slate-200 text-xs py-1.5 h-8.5 rounded-lg"
                    onClick={() => setEditPatient(selectedPatient)}
                  >
                    <Pencil className="w-3 h-3 ml-0.5" /> تعديل البيانات
                  </Button>
                  <AddPatientModal
                    defaultName={selectedPatient.name}
                    defaultPhone={selectedPatient.phone_number}
                    trigger={
                      <Button size="sm" className="gap-1 bg-primary hover:bg-primary/95 text-white text-xs py-1.5 h-8.5 rounded-lg">
                        <Plus className="w-3 h-3 ml-0.5" /> حجز موعد جديد
                      </Button>
                    }
                  />
                </div>
              </div>

              {/* Visited history selector list */}
              {isLoadingVisits ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : visits.length === 0 ? (
                /* Empty visit history state */
                <div className="flex-1 flex items-center justify-center py-8">
                  <div className="border border-dashed border-slate-300 rounded-2xl p-8 text-center flex flex-col items-center justify-center bg-slate-50/50 max-w-sm">
                    <ClipboardList className="w-10 h-10 text-slate-500 mb-3" />
                    <h5 className="font-extrabold text-slate-900 text-sm">لا توجد زيارات مسجلة</h5>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed font-semibold">
                      لم يسجل هذا المريض أي زيارات أو كشوفات في العيادة حتى الآن. يرجى إضافة حجز كشف جديد له للبدء في كتابة الروشتة.
                    </p>
                    <AddPatientModal
                      defaultName={selectedPatient.name}
                      defaultPhone={selectedPatient.phone_number}
                      trigger={
                        <Button className="mt-4 flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-xs text-white">
                          <Plus className="w-3.5 h-3.5" /> حجز كشف / موعد جديد
                        </Button>
                      }
                    />
                  </div>
                </div>
              ) : (
                /* Visit details section */
                <div className="flex-1 flex flex-col justify-between gap-4">
                  
                  {/* Sliding visits timeline buttons */}
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 flex-wrap" dir="rtl">
                    <span className="text-xs font-black text-slate-900">تاريخ الكشوفات والزيارات:</span>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
                      {visits.map((visit) => {
                        const isSelected = visit.id === activeVisit?.id;
                        const date = new Date(visit.created_at || Date.now());
                        return (
                          <button
                            key={visit.id}
                            type="button"
                            onClick={() => setSelectedVisitId(visit.id)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all flex-shrink-0 flex items-center gap-1 ${
                              isSelected 
                                ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-xs" 
                                : "bg-slate-50 text-slate-800 border border-transparent hover:bg-slate-100"
                            }`}
                          >
                            <Calendar className="w-3 h-3 ml-0.5" />
                            <span>
                              {visit.visit_type === "consultation" ? "كشف" : "إعادة"} — {date.toLocaleDateString("ar-EG", { month: "short", day: "numeric" })}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mode selector switch: Digital prescription vs. Hand-written upload */}
                  <div className="flex justify-between items-center gap-2 flex-wrap" dir="rtl">
                    <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/50">
                      <button
                        type="button"
                        onClick={() => setPrescriptionMode("digital")}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                          prescriptionMode === "digital" ? "bg-white text-blue-600 shadow-xs" : "text-slate-800 hover:text-slate-950"
                        }`}
                      >
                        روشتة رقمية (واتساب)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrescriptionMode("paper")}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                          prescriptionMode === "paper" ? "bg-white text-blue-600 shadow-xs" : "text-slate-800 hover:text-slate-950"
                        }`}
                      >
                        روشتة ورقية (رفع صورة)
                      </button>
                    </div>

                    <span className="text-xs font-bold text-slate-850">حالة الزيارة: {activeVisit?.status === "completed" ? "مكتملة ✅" : "في الانتظار ⏳"}</span>
                  </div>

                  {/* Mode specific component view */}
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    {prescriptionMode === "digital" ? (
                      /* Digital prescription details builder */
                      <div className="space-y-4">
                        
                        {/* Symptoms & Diagnosis textarea grids */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5 text-right">
                            <label className="text-xs font-black text-slate-950 block mb-1">الشكوى الحالية والتحاليل (Symptoms):</label>
                            <textarea
                              value={draftSymptoms}
                              onChange={(e) => setDraftSymptoms(e.target.value)}
                              placeholder="مثال: صداع مستمر منذ يومين مع ارتفاع طفيف في درجات الحرارة..."
                              rows={2.5}
                              className="w-full text-xs bg-slate-50 border border-slate-350 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors text-right font-bold text-slate-950 placeholder:text-slate-500"
                              dir="rtl"
                            />
                          </div>
                          <div className="space-y-1.5 text-right">
                            <label className="text-xs font-black text-slate-950 block mb-1">التشخيص الحالي (Diagnosis):</label>
                            <textarea
                              value={draftDiagnosis}
                              onChange={(e) => setDraftDiagnosis(e.target.value)}
                              placeholder="مثال: التهاب جيوب أنفية حاد نتيجة تقلب الجو موسمياً..."
                              rows={2.5}
                              className="w-full text-xs bg-slate-50 border border-slate-350 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors text-right font-bold text-slate-950 placeholder:text-slate-500"
                              dir="rtl"
                            />
                          </div>
                        </div>

                        {/* Rx Medication structured builder */}
                        <div className="space-y-2 text-right">
                          <label className="text-xs font-black text-slate-950 block mb-1">الروشتة الدوائية الموصوفة (Rx):</label>
                          
                          {/* Medicine entries list */}
                          {draftRx.length > 0 ? (
                            <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs text-[11px]" dir="rtl">
                              <div className="bg-slate-50/80 px-3 py-2 border-b border-slate-300 grid grid-cols-12 font-bold text-slate-900 text-right">
                                <div className="col-span-5">اسم الدواء</div>
                                <div className="col-span-4">الجرعة المحددة</div>
                                <div className="col-span-2">الفترة</div>
                                <div className="col-span-1 text-center">حذف</div>
                              </div>
                              <div className="divide-y divide-slate-100 bg-white">
                                {draftRx.map((med, idx) => (
                                  <div key={idx} className="px-3 py-2 grid grid-cols-12 text-slate-800 font-bold items-center text-right hover:bg-slate-50/20">
                                    <div className="col-span-5 font-black text-slate-950">{med.name}</div>
                                    <div className="col-span-4 text-slate-850">{med.dose || "—"}</div>
                                    <div className="col-span-2 text-slate-700">{med.duration || "—"}</div>
                                    <div className="col-span-1 text-center">
                                      <button 
                                        type="button" 
                                        onClick={() => handleRemoveMed(idx)}
                                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 mx-auto" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="border border-slate-200 bg-slate-50/30 rounded-xl p-4 text-center text-[10px] text-slate-600 font-semibold">
                              لا يوجد أدوية مضافة في الروشتة الرقمية بعد. استخدم النموذج أدناه لإضافة الأدوية.
                            </div>
                          )}

                          {/* Medicine adding inputs row */}
                          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-300 flex flex-col sm:flex-row gap-2.5 items-end" dir="rtl">
                            <div className="flex-1 space-y-1 w-full text-right">
                              <span className="text-[10px] font-black text-slate-900">اسم الدواء (العلمي/التجاري):</span>
                              <input
                                type="text"
                                placeholder="مثال: Panadol Joint"
                                value={newMedName}
                                onChange={(e) => setNewMedName(e.target.value)}
                                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/20 text-right font-extrabold text-slate-950 placeholder:text-slate-500"
                              />
                            </div>
                            <div className="w-full sm:w-1/3 space-y-1 text-right">
                              <span className="text-[10px] font-black text-slate-900">الجرعة:</span>
                              <input
                                type="text"
                                placeholder="قرص كل 8 ساعات"
                                value={newMedDose}
                                onChange={(e) => setNewMedDose(e.target.value)}
                                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/20 text-right font-extrabold text-slate-950 placeholder:text-slate-500"
                              />
                            </div>
                            <div className="w-full sm:w-1/4 space-y-1 text-right">
                              <span className="text-[10px] font-black text-slate-900">الفترة:</span>
                              <input
                                type="text"
                                placeholder="3 أيام"
                                value={newMedDuration}
                                onChange={(e) => setNewMedDuration(e.target.value)}
                                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/20 text-right font-extrabold text-slate-950 placeholder:text-slate-500"
                              />
                            </div>
                            <Button 
                              type="button" 
                              onClick={handleAddMed}
                              size="sm"
                              className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold h-8.5 px-4 rounded-lg w-full sm:w-auto"
                            >
                              <Plus className="w-3.5 h-3.5 ml-1" /> إضافة
                            </Button>
                          </div>
                        </div>

                        {/* Actions line */}
                        <div className="flex gap-2 justify-end pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleSendWhatsAppPrescription}
                            disabled={draftRx.length === 0 && !draftDiagnosis}
                            className="flex items-center gap-1.5 border-emerald-300 hover:bg-emerald-50/50 hover:border-emerald-450 text-emerald-800 font-extrabold text-xs py-1.5 h-9 rounded-lg"
                          >
                            <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                            إرسال عبر واتساب
                          </Button>
                          <Button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-white text-xs py-1.5 h-9 rounded-lg"
                          >
                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            حفظ الروشتة
                          </Button>
                        </div>

                      </div>
                    ) : (
                      /* Paper prescription image uploader */
                      <div className="space-y-4" dir="rtl">
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment" 
                          className="hidden" 
                          ref={fileInputRef}
                          onChange={handleFileChange}
                        />
                        {activeVisit.prescription_url ? (
                          <div className="space-y-4">
                            <div className="relative border border-slate-300 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center max-h-[260px] shadow-xs">
                              <img 
                                src={activeVisit.prescription_url} 
                                alt="الروشتة الورقية" 
                                className="max-h-[260px] object-contain w-full"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                onClick={() => activeVisit.prescription_url && window.open(activeVisit.prescription_url, "_blank")}
                                className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-900 font-bold h-9 rounded-lg border-slate-300"
                              >
                                <ExternalLink className="w-4 h-4 ml-1" /> عرض الحجم الكامل
                              </Button>
                              <Button 
                                variant="secondary"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center justify-center gap-1.5 text-xs h-9 rounded-lg font-bold text-slate-800"
                                disabled={isUploading}
                              >
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4 ml-1" />}
                                تغيير الصورة
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="border border-dashed border-slate-400 rounded-2xl p-10 text-center flex flex-col items-center justify-center bg-slate-50/50">
                            <Camera className="w-10 h-10 text-slate-500 mb-2.5" />
                            <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">رفع صورة الروشتة الورقية</h5>
                            <p className="text-[10px] text-slate-700 font-semibold mt-1 max-w-[240px] mx-auto leading-relaxed">
                              التقط صورة للروشتة الورقية المكتوبة بخط اليد لربطها بملف المريض والرجوع إليها لاحقاً.
                            </p>
                            <Button 
                              onClick={() => fileInputRef.current?.click()} 
                              className="mt-4 flex items-center gap-1 bg-primary hover:bg-primary/95 text-xs text-white h-8.5 rounded-lg"
                              disabled={isUploading}
                            >
                              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5 ml-1" />}
                              اختيار / التقاط صورة
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Previous records & uploaded files attachments list */}
                  {visits.filter(v => v.prescription_url).length > 0 && (
                    <div className="space-y-2 border-t border-slate-100 pt-3 flex-shrink-0 text-right" dir="rtl">
                      <span className="text-xs font-black text-slate-900 block">المرفقات والروشتات السابقة للمريض:</span>
                      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 max-h-[85px]">
                        {visits
                          .filter(v => v.prescription_url)
                          .map((v) => {
                            const date = new Date(v.created_at || Date.now());
                            return (
                              <div 
                                key={v.id}
                                onClick={() => v.prescription_url && window.open(v.prescription_url, "_blank")}
                                className="border border-slate-300 hover:border-blue-400 rounded-xl p-2 flex items-center gap-2 cursor-pointer transition-colors bg-slate-50/50"
                              >
                                <FileText className="w-6 h-6 text-red-500 flex-shrink-0" />
                                <div className="text-right">
                                  <h6 className="font-bold text-[9px] text-slate-950 leading-tight">روشتة ورقية — {date.toLocaleDateString("ar-EG")}</h6>
                                  <p className="text-[7.5px] text-slate-700 font-bold mt-0.5">{v.visit_type === "consultation" ? "كشف" : "إعادة"}</p>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          ) : (
            /* Selected patient empty placeholder state */
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400" dir="rtl">
              <Users className="w-14 h-14 mb-4 text-slate-200" />
              <h5 className="font-bold text-slate-700 text-sm">حدد مريضاً لبدء الجلسة</h5>
              <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto text-center leading-relaxed">
                يرجى تحديد أحد المرضى من قائمة الدليل الجانبية لعرض تاريخ زياراتهم وكتابة الروشتات الرقمية.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Edit Patient Modal Wrapper */}
      {editPatient && (
        <EditPatientModal
          open={!!editPatient}
          onOpenChange={(open) => { if (!open) setEditPatient(null); }}
          patient={editPatient}
        />
      )}
    </div>
  );
}

export default function PatientsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <PatientsWorkstation />
    </Suspense>
  );
}
