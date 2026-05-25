"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useAddPatient } from "@/hooks/useQueue";

const formSchema = z.object({
  phone: z.string().min(11, "يجب أن يكون رقم الهاتف 11 رقماً").max(11, "رقم الهاتف غير صحيح"),
  name: z.string().min(2, "الاسم مطلوب"),
  visitType: z.enum(["consultation", "follow_up"]),
  scheduled_time: z.string().optional(),
});

export function AddPatientModal({
  trigger,
  defaultName = "",
  defaultPhone = "",
  defaultScheduledTime = "",
}: {
  trigger?: React.ReactNode;
  defaultName?: string;
  defaultPhone?: string;
  defaultScheduledTime?: string;
}) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: defaultPhone,
      name: defaultName,
      visitType: "consultation",
      scheduled_time: defaultScheduledTime,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        phone: defaultPhone,
        name: defaultName,
        visitType: "consultation",
        scheduled_time: defaultScheduledTime,
      });
    }
  }, [open, defaultName, defaultPhone, defaultScheduledTime, reset]);

  const { mutateAsync: addPatient } = useAddPatient();

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // Ensure scheduled_time is sent as a proper ISO string with timezone context
      const payload = {
        ...data,
        scheduled_time: data.scheduled_time ? new Date(data.scheduled_time).toISOString() : undefined
      };
      
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
      await addPatient(payload as any);

      if (isOffline) {
        toast.info("تم حفظ بيانات المريض محلياً. سيتم مزامنتها تلقائياً عند عودة الاتصال بالإنترنت.", {
          description: "وضع عدم الاتصال (أوفلاين)",
          duration: 6000,
        });
      } else {
        toast.success("تمت إضافة المريض للطابور بنجاح");
      }
      setOpen(false);
      reset();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء الإضافة");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      {trigger ? (
        <DialogTrigger render={trigger as any} />
      ) : (
        <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          <Plus className="w-4 h-4" />
          إضافة مريض
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right pr-6">إضافة مريض للطابور</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              placeholder="01xxxxxxxxx"
              dir="ltr"
              className="text-left"
              {...register("phone")}
            />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">اسم المريض</Label>
            <Input
              id="name"
              placeholder="الاسم الثلاثي"
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>نوع الكشف</Label>
            <Controller
              control={control}
              name="visitType"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الكشف">
                      {field.value === "consultation" ? "كشف جديد" : "إعادة"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">كشف جديد</SelectItem>
                    <SelectItem value="follow_up">إعادة</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.visitType && <p className="text-xs text-red-500">{errors.visitType.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_time">موعد الحجز (اختياري)</Label>
            <input
              id="scheduled_time"
              type="datetime-local"
              dir="ltr"
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-left block md:text-sm dark:bg-input/30"
              {...register("scheduled_time")}
            />
            <p className="text-xs text-slate-500">اتركه فارغاً لإضافته للطابور الحالي مباشرة</p>
          </div>

          <div className="pt-4 flex gap-2 w-full">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "جاري الإضافة..." : "تأكيد وإضافة للطابور"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
