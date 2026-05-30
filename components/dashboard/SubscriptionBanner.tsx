"use client";

import React, { useState } from "react";
import { useSubscription } from "@/components/providers/SubscriptionProvider";
import { AlertTriangle, X, CreditCard, MessageSquare, ExternalLink } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useSettings } from "@/hooks/useQueue";

const ADMIN_INSTAPAY_ID = process.env.NEXT_PUBLIC_ADMIN_INSTAPAY_ID || "01110203939"; 
const ADMIN_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER || "201025110560";

export function SubscriptionBanner() {
  const { isWarning, daysRemaining, subscriptionExpiresAt } = useSubscription();
  const { data: settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If subscription is not in warning range or has been dismissed, render nothing
  if (!isWarning || dismissed) {
    return null;
  }

  // Pre-fill message for WhatsApp receipt confirmation
  const clinicName = settings?.name || "العيادة"; 
  const waText = encodeURIComponent(
    `السلام عليكم، لقد قمت بتحويل الاشتراك الشهري لعيادة: ${clinicName}. يرجى تأكيد استلام الدفعة.`
  );
  const waLink = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${waText}`;

  // Localized days template
  const getDaysText = (days: number) => {
    if (days === 1) return "يوم واحد";
    if (days === 2) return "يومان";
    if (days >= 3 && days <= 10) return `${days} أيام`;
    return `${days} يوماً`;
  };

  return (
    <>
      <div 
        className="w-full bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 flex items-center justify-between animate-in slide-in-from-top duration-300 relative z-30"
        dir="rtl"
      >
        <div className="flex items-center gap-2 md:gap-3 flex-1">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 flex-shrink-0">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
          </div>
          <p className="text-sm font-medium leading-normal">
            تنبيه: متبقي <span className="font-bold underline decoration-wavy decoration-amber-600">{getDaysText(daysRemaining)}</span> على انتهاء اشتراك العيادة. يرجى تجديد الاشتراك لتجنب إيقاف الخدمة.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsOpen(true)}
            className="border-amber-300 bg-amber-100/50 hover:bg-amber-100 text-amber-950 font-bold text-xs px-3 py-1.5 h-auto rounded-lg transition-all"
          >
            دفع الآن <CreditCard className="w-3.5 h-3.5 mr-1" />
          </Button>

          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => setDismissed(true)}
            className="text-amber-600 hover:text-amber-900 hover:bg-amber-100/50 w-7 h-7 rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Payment Details Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right pr-6">تجديد اشتراك العيادة</DialogTitle>
            <DialogDescription className="text-right pr-6 mt-1.5">
              بيانات سداد قيمة الاشتراك الشهري لـ ClinicOS
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 px-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-sm border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">قيمة الاشتراك:</span>
                <span className="font-bold text-slate-800">500 جنيه مصري / شهرياً</span>
              </div>
              <div className="space-y-2">
                <span className="text-xs text-slate-400">طريقة التحويل المفضلة:</span>
                <div className="flex flex-col bg-white p-3 rounded-lg border border-slate-200 text-center gap-1">
                  <span className="text-xs font-semibold text-slate-500">رقم الحساب / إنستاباي (InstaPay)</span>
                  <span className="font-mono font-bold text-primary text-xl select-all tracking-wider">{ADMIN_INSTAPAY_ID}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 text-center leading-relaxed">
              يرجى إرسال لقطة الشاشة للتحويل عبر الواتساب فور إتمام التحويل لتسجيل تمديد الاشتراك بالكامل في غضون دقائق.
            </p>
          </div>

          <div className="pt-4 flex flex-col gap-2 w-full">
            <a 
              href={waLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "default" }),
                "w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl py-3 flex items-center justify-center font-medium"
              )}
            >
              <MessageSquare className="w-4 h-4" />
              إرسال صورة التحويل عبر واتساب
            </a>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="w-full rounded-xl py-3"
            >
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
