import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentModal } from "./PaymentModal";
import { Phone, ArrowLeft, CheckCircle2, MessageCircle, Camera, FileText, Loader2, Clock, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateAppointmentStatus, useUploadPrescription, useSettings } from "@/hooks/useQueue";
import { formatEgyptianPhoneForWhatsApp } from "@/utils/format";
import { EditAppointmentModal } from "./EditAppointmentModal";

type PatientStatus = "waiting" | "in_clinic" | "completed";

interface QueueCardProps {
  id: string;
  patientId: string;
  queueNumber: number;
  patientName: string;
  patientPhone: string;
  visitType: "consultation" | "follow_up";
  status: PatientStatus;
  waitTimeMins: number;
  notified?: boolean;
  prescriptionUrl?: string | null;
  scheduledTime?: string | null;
}

export function QueueCard({
  id,
  patientId,
  queueNumber,
  patientName,
  patientPhone,
  visitType,
  status,
  waitTimeMins,
  notified,
  prescriptionUrl,
  scheduledTime,
}: QueueCardProps) {
  const router = useRouter();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateAppointmentStatus();
  const { mutate: uploadPrescription, isPending: isUploading } = useUploadPrescription();
  const { data: settings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Reminder Logic: Check if appointment is in the next 30 minutes
  const isNearTime = scheduledTime && status === "waiting" && (() => {
    const timeUntil = new Date(scheduledTime).getTime() - Date.now();
    return timeUntil > 0 && timeUntil <= 30 * 60 * 1000;
  })();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;
    
    uploadPrescription({ file, appointmentId: id, patientId });
  };
  
  const isWaiting = status === "waiting";
  const isInClinic = status === "in_clinic";
  const isCompleted = status === "completed";

  const handleWhatsApp = () => {
    const formattedPhone = formatEgyptianPhoneForWhatsApp(patientPhone);
    if (!formattedPhone) return;

    const locationUrl = settings?.location_url || "";
    
    let message = "";
    if (isNearTime) {
      message = `* تذكير بموعد الكشف *\n\nمرحباً ${patientName}،\nنود تذكيرك بموعد حجزك اليوم في العيادة خلال أقل من 30 دقيقة.`;
    } else {
      message = `* تأكيد الحجز *\n\nمرحباً ${patientName}،\nتم تأكيد حجزك بنجاح في العيادة.`;
    }

    if (scheduledTime) {
      const dt = new Date(scheduledTime);
      const dateStr = dt.toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      const timeStr = dt.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
      message += `\n\n- التاريخ: ${dateStr}\n- الوقت: ${timeStr}`;
    }

    if (locationUrl) {
      message += `\n\n- موقع العيادة:\n${locationUrl}`;
    }
    
    message += `\n\n${isNearTime ? "نرجو الحضور فوراً لتجنب التأخير. شكراً لك!" : "نرجو الحضور في الموعد المحدد. شكراً لك!"}`;
    
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all hover:shadow-md cursor-pointer active:scale-[0.99] active:shadow-inner",
        isInClinic && "border-primary shadow-sm",
        isCompleted && "opacity-75 bg-slate-50"
      )}
      onClick={() => {
        if (!isPaymentModalOpen && !isEditModalOpen) setIsEditModalOpen(true);
      }}
    >
      <CardContent className="p-0">
        <div className="flex items-center p-4 gap-4">
          
          {/* Avatar / Number */}
          <div className={cn(
            "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold",
            isInClinic ? "bg-primary text-white" : "bg-slate-100 text-slate-600",
            isCompleted && "bg-emerald-100 text-emerald-600"
          )}>
            #{queueNumber}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-900 truncate">
              {patientName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={visitType === "consultation" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                {visitType === "consultation" ? "كشف جديد" : "إعادة"}
              </Badge>
              {notified && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-600 border-blue-200 gap-1 flex items-center">
                  <CheckCircle2 className="w-3 h-3" /> تم التنبيه
                </Badge>
              )}
              {scheduledTime ? (
                <Badge variant="outline" className={cn(
                  "text-[10px] px-1.5 py-0 gap-1 flex items-center",
                  isNearTime ? "bg-red-50 text-red-600 border-red-200 animate-pulse" : "bg-purple-50 text-purple-600 border-purple-200"
                )}>
                  <Clock className="w-3 h-3" /> {new Date(scheduledTime).toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}
                  {isNearTime && <span className="mr-1">(اقترب الموعد)</span>}
                </Badge>
              ) : (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {waitTimeMins} دقيقة
                </span>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="hidden sm:block">
            {isWaiting && (
              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                في الانتظار
              </Badge>
            )}
            {isInClinic && (
              <Badge variant="default" className="bg-primary hover:bg-primary animate-pulse">
                عند الطبيب
              </Badge>
            )}
            {isCompleted && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                مكتمل
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mr-4">
            {/* Prescription Upload (For Completed appointments) */}
            {isCompleted && (
              <>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  onClick={(e) => e.stopPropagation()}
                />
                
                {prescriptionUrl ? (
                  <button 
                    type="button" 
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-blue-200 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(prescriptionUrl, "_blank");
                    }}
                  >
                    <FileText className="w-4 h-4" /> <span>عرض الروشتة</span>
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    <span>{isUploading ? "جاري الرفع..." : "رفع روشتة"}</span>
                  </button>
                )}
              </>
            )}

            {!isCompleted && (
              <>
                {isWaiting && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className={cn(
                      "w-10 h-10 p-0 rounded-full",
                      isNearTime ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" : "text-slate-400 hover:text-primary"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWhatsApp();
                    }}
                    disabled={!patientPhone}
                    title={isNearTime ? "إرسال تذكير بالموعد" : "إرسال رسالة واتساب"}
                  >
                    {isNearTime ? <Bell className="w-4 h-4 animate-bounce" /> : <WhatsAppIcon className="w-4.5 h-4.5 text-emerald-600 hover:text-emerald-500 transition-colors" />}
                  </Button>
                )}
                {isWaiting ? (
                  <Button size="sm" className="gap-2" onClick={(e) => {
                    e.stopPropagation();
                    updateStatus({ id, status: "in_clinic" });
                  }} disabled={isUpdating}>
                    دخول للطبيب <ArrowLeft className="w-4 h-4" />
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-2 border-primary text-primary hover:bg-primary/5" 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/patients?patientId=${patientId}&appointmentId=${id}`);
                      }}
                    >
                      <FileText className="w-4 h-4" /> الكشف والروشتة
                    </Button>
                    <Button size="sm" variant="secondary" className="gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200" onClick={(e) => {
                      e.stopPropagation();
                      setIsPaymentModalOpen(true);
                    }} disabled={isUpdating}>
                      إنهاء <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </CardContent>
      
      <PaymentModal 
        open={isPaymentModalOpen} 
        onOpenChange={setIsPaymentModalOpen} 
        appointmentId={id} 
        patientName={patientName} 
      />

      <EditAppointmentModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        appointment={{
          id,
          patientId,
          patientName,
          patientPhone,
          visitType,
          scheduledTime,
        }}
      />
    </Card>
  );
}

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

