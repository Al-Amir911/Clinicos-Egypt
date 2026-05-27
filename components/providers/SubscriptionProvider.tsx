"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSettings } from "@/hooks/useQueue";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Lock, LogOut, RefreshCw, MessageSquare, AlertTriangle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

// 1. Define custom settings for the subscriber payment collection
const ADMIN_INSTAPAY_ID = "01110203939"; // Change to your InstaPay handle
const ADMIN_WHATSAPP_NUMBER = "201025110560"; // Change to your WhatsApp phone number (with country code, e.g. 201001234567)

interface SubscriptionContextType {
  subscriptionStatus: "active" | "suspended" | "grace_period" | null;
  subscriptionExpiresAt: string | null;
  daysRemaining: number;
  isLocked: boolean;
  isWarning: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscriptionStatus: "active",
  subscriptionExpiresAt: null,
  daysRemaining: 30,
  isLocked: false,
  isWarning: false,
});

export const useSubscription = () => useContext(SubscriptionContext);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { data: settings, isLoading, error, refetch } = useSettings();
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Track network status for custom offline experience
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      const goOnline = () => setIsOffline(false);
      const goOffline = () => setIsOffline(true);
      window.addEventListener("online", goOnline);
      window.addEventListener("offline", goOffline);
      return () => {
        window.removeEventListener("online", goOnline);
        window.removeEventListener("offline", goOffline);
      };
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Determine subscription parameters
  const subscriptionStatus = settings?.subscription_status || "active";
  const subscriptionExpiresAt = settings?.subscription_expires_at || null;

  let daysRemaining = 30;
  let isLocked = false;
  let isWarning = false;

  if (subscriptionExpiresAt) {
    const expiresDate = new Date(subscriptionExpiresAt);
    const now = new Date();
    const timeDiff = expiresDate.getTime() - now.getTime();
    daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    // Lock logic: expired (daysRemaining <= 0) OR status is suspended
    isLocked = daysRemaining <= 0 || subscriptionStatus === "suspended";
    
    // Warning logic: between 0 and 3 days remaining, and not suspended
    isWarning = daysRemaining > 0 && daysRemaining <= 3 && subscriptionStatus !== "suspended";
  } else {
    // If settings loaded but no expiration date is set, check if suspended
    isLocked = subscriptionStatus === "suspended";
  }

  // Graceful fallback for offline startup
  // If we are offline and settings are not cached, we do not want to lock them out completely.
  const finalIsLocked = isLocked && !(isOffline && !settings);

  // Render full screen loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-slate-600 font-medium text-lg font-sans">جاري التحقق من حالة الاشتراك...</p>
      </div>
    );
  }

  // If locked, intercept layout rendering and display premium lock screen
  if (finalIsLocked) {
    const clinicName = settings?.name || "العيادة";
    const waText = encodeURIComponent(
      `السلام عليكم دكتور أمير، لقد قمت بتحويل قيمة الاشتراك الشهري لعيادة: ${clinicName}. يرجى تفعيل الحساب.`
    );
    const waLink = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${waText}`;

    return (
      <div 
        className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-slate-900 bg-cover bg-center bg-no-repeat relative"
        dir="rtl"
        style={{
          backgroundImage: "radial-gradient(circle at top right, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 1))"
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <Card className="w-full max-w-lg border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl text-slate-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 left-0 h-[4px] bg-gradient-to-r from-red-500 via-amber-500 to-red-600" />
          
          <CardHeader className="text-center pt-8 pb-6">
            <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4 animate-pulse">
              <Lock className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold font-sans tracking-tight text-white">
              انتهت صلاحية تفعيل الحساب
            </CardTitle>
            <CardDescription className="text-slate-400 text-base mt-2">
              يرجى تجديد الاشتراك الشهري لعيادتكم لمواصلة استخدام خدمات <span className="font-semibold text-primary">ClinicOS</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-6 md:px-8">
            {isOffline && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-3 text-amber-400 text-sm">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>⚠️ تعذر الاتصال بالخادم. يرجى الاتصال بالإنترنت والضغط على إعادة المحاولة بعد السداد.</span>
              </div>
            )}

            <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
                <span className="text-slate-400 text-sm">قيمة الاشتراك:</span>
                <span className="font-bold text-white text-lg">500 جنيه مصري / شهرياً</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">طريقة الدفع الأساسية:</span>
                  <span className="font-semibold text-emerald-400">إنستاباي (InstaPay)</span>
                </div>
                <div className="flex flex-col bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-center space-y-1">
                  <span className="text-xs text-slate-500">رقم الهاتف / عنوان إنستاباي (InstaPay ID)</span>
                  <span className="font-mono text-xl md:text-2xl font-bold text-white select-all tracking-wider">{ADMIN_INSTAPAY_ID}</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-center text-slate-500">
              بعد إتمام عملية التحويل، يرجى النقر على الزر أدناه لإرسال لقطة شاشة التحويل (الوصل) لتفعيل حسابكم فوراً.
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 px-6 md:px-8 pb-8 pt-4">
            <a 
              href={waLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "default" }),
                "w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-6 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-emerald-950/20 gap-2 text-base flex items-center justify-center h-auto"
              )}
            >
              <MessageSquare className="w-5 h-5 ml-1" />
              إرسال تأكيد الدفع عبر واتساب
            </a>

            <div className="flex gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-1/2 border-slate-800 bg-slate-950/20 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl py-5 gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                تحديث الحالة
              </Button>

              <Button 
                variant="ghost" 
                onClick={() => signOut.mutate()}
                className="w-1/2 text-slate-400 hover:text-red-400 hover:bg-red-950/10 rounded-xl py-5 gap-2"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <SubscriptionContext.Provider value={{
      subscriptionStatus,
      subscriptionExpiresAt,
      daysRemaining,
      isLocked,
      isWarning
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
