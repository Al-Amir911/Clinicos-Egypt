"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useLogPayment } from "@/hooks/useQueue";
import { CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  amount: z.string().min(1, "المبلغ مطلوب"),
  method: z.enum(["cash", "instapay"]),
});

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  patientName: string;
}

export function PaymentModal({ open, onOpenChange, appointmentId, patientName }: PaymentModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "0",
      method: "cash",
    },
  });

  const { mutateAsync: logPayment } = useLogPayment();

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await logPayment({ id: appointmentId, amount: Number(data.amount), method: data.method });
      
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        toast.warning("تم إنهاء الكشف وتسجيل الدفع محلياً. سيتم المزامنة عند عودة الاتصال بالإنترنت.");
      } else {
        toast.success("تم إنهاء الكشف وتسجيل الدفع بنجاح");
      }
      onOpenChange(false);
      reset();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تسجيل الدفع");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right pr-6">إنهاء الكشف وتسجيل الدفع</DialogTitle>
          <DialogDescription className="text-right pr-6 mt-1.5">
            تسجيل تفاصيل الدفع للمريض <span className="font-semibold text-slate-800">{patientName}</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          
          <div className="space-y-2">
            <Label htmlFor="amount">المبلغ المدفوع (جنيه مصري)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="مثال: 300"
              dir="ltr"
              className="text-left"
              {...register("amount")}
            />
            {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>طريقة الدفع</Label>
            <Controller
              control={control}
              name="method"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر طريقة الدفع">
                      {field.value === "cash" ? "نقدي (Cash)" : "إنستاباي (InstaPay)"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي (Cash)</SelectItem>
                    <SelectItem value="instapay">إنستاباي (InstaPay)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.method && <p className="text-xs text-red-500">{errors.method.message}</p>}
          </div>

          <div className="pt-4 flex gap-2 w-full">
            <Button type="button" variant="outline" className="w-1/3" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" className="w-2/3 bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
              {isSubmitting ? "جاري التسجيل..." : (
                <>
                  تأكيد وإنهاء الكشف <CheckCircle2 className="mr-2 w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
