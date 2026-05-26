"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { syncOfflineAppointments } from "@/utils/offlineQueue";

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

    // 2. Track Network Status
    const handleOnline = async () => {
      setIsOnline(true);
      toast.success("تم إعادة الاتصال بالإنترنت بنجاح. جاري مزامنة البيانات...", {
        description: "أنت متصل بالإنترنت الآن",
        duration: 3000,
      });

      try {
        await syncOfflineAppointments();
        queryClient.invalidateQueries({ queryKey: ["appointmentsServer"] });
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
        queryClient.invalidateQueries({ queryKey: ["dailyStatsServer"] });
        queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
        queryClient.invalidateQueries({ queryKey: ["allPatientsServer"] });
        queryClient.invalidateQueries({ queryKey: ["allPatients"] });
        toast.success("تمت مزامنة جميع التعديلات والمواعيد المحلية بنجاح.");
      } catch (err) {
        console.error("Failed to sync offline queue on reconnect:", err);
        toast.error("فشلت بعض عمليات مزامنة البيانات المحلية. سيتم المحاولة لاحقاً.");
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("تم قطع الاتصال بالإنترنت. تعمل الآن في وضع عدم الاتصال.", {
        description: "يمكنك متابعة إضافة المرضى للطابور محلياً، وسيتم حفظهم ومزامنتهم عند عودة الاتصال.",
        duration: 10000,
      });
    };

    // Set initial network state
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [queryClient]);

  return (
    <>
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-center py-1 text-sm font-semibold shadow-md animate-in slide-in-from-top duration-300">
          ⚠️ تعمل الآن في وضع عدم الاتصال بالإنترنت (Offline Mode)
        </div>
      )}
      {children}
    </>
  );
}
