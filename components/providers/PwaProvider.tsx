"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);

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
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("تم إعادة الاتصال بالإنترنت بنجاح. تم مزامنة التغييرات تلقائياً.", {
        description: "أنت متصل بالإنترنت الآن",
        duration: 5000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("تم قطع الاتصال بالإنترنت. تعمل الآن في وضع عدم الاتصال.", {
        description: "يمكنك متابعة العمل على البيانات الحالية، ولكن لن تتمكن من رفع صور الروشتات حتى يعود الاتصال.",
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
  }, []);

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
