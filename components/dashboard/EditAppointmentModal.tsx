"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { useUpdateAppointmentDetails, useDeleteAppointment } from "@/hooks/useQueue";

const formSchema = z.object({
  phone: z.string().min(11, "يجب أن يكون رقم الهاتف 11 رقماً").max(11, "رقم الهاتف غير صحيح"),
  name: z.string().min(2, "الاسم مطلوب"),
  visitType: z.enum(["consultation", "follow_up"]),
  scheduled_date: z.string().optional(),
  scheduled_time_only: z.string().optional(),
}).refine((data) => {
  if (data.scheduled_time_only && !data.scheduled_date) {
    return false;
  }
  return true;
}, {
  message: "يجب تحديد التاريخ إذا قمت بتحديد الوقت",
  path: ["scheduled_date"],
});

interface EditAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: {
    id: string;
    patientId: string;
    patientName: string;
    patientPhone: string;
    visitType: "consultation" | "follow_up";
    scheduledTime?: string | null;
  };
}

export function EditAppointmentModal({
  open,
  onOpenChange,
  appointment,
}: EditAppointmentModalProps) {
  const { mutateAsync: updateAppointment } = useUpdateAppointmentDetails();
  const { mutateAsync: deleteAppointment } = useDeleteAppointment();

  // Format the date for the date and time inputs
  const formatForInput = (isoString?: string | null) => {
    if (!isoString) return { date: "", time: "" };
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return { date: "", time: "" };
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return {
        date: `${year}-${month}-${day}`,
        time: `${hours}:${minutes}`,
      };
    } catch (e) {
      return { date: "", time: "" };
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: appointment.patientPhone,
      name: appointment.patientName,
      visitType: appointment.visitType,
      scheduled_date: formatForInput(appointment.scheduledTime).date,
      scheduled_time_only: formatForInput(appointment.scheduledTime).time,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        phone: appointment.patientPhone,
        name: appointment.patientName,
        visitType: appointment.visitType,
        scheduled_date: formatForInput(appointment.scheduledTime).date,
        scheduled_time_only: formatForInput(appointment.scheduledTime).time,
      });
    }
  }, [open, appointment, reset]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      let scheduled_time: string | null = null;
      if (data.scheduled_date) {
        const timePart = data.scheduled_time_only || "00:00";
        scheduled_time = new Date(`${data.scheduled_date}T${timePart}`).toISOString();
      }

      await updateAppointment({
        id: appointment.id,
        patientId: appointment.patientId,
        name: data.name,
        phone: data.phone,
        visitType: data.visitType,
        scheduled_time,
      });
      
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        toast.warning("تم حفظ التعديلات محلياً. سيتم المزامنة عند عودة الاتصال بالإنترنت.");
      } else {
        toast.success("تم تحديث بيانات الحجز بنجاح");
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء التحديث");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAppointment(appointment.id);
      
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        toast.warning("تم حذف الحجز محلياً. سيتم المزامنة عند عودة الاتصال بالإنترنت.");
      } else {
        toast.success("تم حذف الحجز بنجاح");
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء الحذف");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right pr-6">تعديل بيانات الحجز</DialogTitle>
        </DialogHeader>
        
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="space-y-4 mt-4"
          onClick={(e) => e.stopPropagation()}
        >
          
          <div className="space-y-2">
            <Label htmlFor="edit-phone">رقم الهاتف</Label>
            <Input
              id="edit-phone"
              placeholder="01xxxxxxxxx"
              dir="ltr"
              className="text-left"
              {...register("phone")}
            />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name">اسم المريض</Label>
            <Input
              id="edit-name"
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue>
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
          </div>

          <div className="space-y-2">
            <Label>موعد الحجز</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="edit-scheduled_date" className="text-xs text-slate-400">التاريخ</Label>
                <input
                  id="edit-scheduled_date"
                  type="date"
                  dir="ltr"
                  className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-left block md:text-sm dark:bg-input/30"
                  {...register("scheduled_date")}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-scheduled_time_only" className="text-xs text-slate-400">الوقت</Label>
                <input
                  id="edit-scheduled_time_only"
                  type="time"
                  dir="ltr"
                  className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-left block md:text-sm dark:bg-input/30"
                  {...register("scheduled_time_only")}
                />
              </div>
            </div>
            {errors.scheduled_date && <p className="text-xs text-red-500">{errors.scheduled_date.message}</p>}
            <p className="text-xs text-slate-500">اتركه فارغاً ليصبح مريضاً عادياً في الطابور</p>
          </div>

          <div className="pt-6 flex gap-2">
            <button 
              type="button" 
              className="flex-1 px-4 py-2 text-sm font-medium border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenChange(false);
              }}
            >
              إلغاء
            </button>
            <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting}>
              <Save className="w-4 h-4" />
              حفظ التعديلات
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger 
                render={
                  <button 
                    type="button" 
                    className="p-2 text-red-600 border border-red-200 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                }
              />
              <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    سيتم حذف هذا الحجز نهائياً من الطابور. لا يمكن التراجع عن هذا الإجراء.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    تأكيد الحذف
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
