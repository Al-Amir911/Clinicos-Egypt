"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  scheduled_time: z.string().optional(),
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

  // Format the date for the datetime-local input (YYYY-MM-DDTHH:mm)
  const formatForInput = (isoString?: string | null) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "";
      
      // Adjust for timezone offset to get the correct "local" string for the input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
      return "";
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
      scheduled_time: formatForInput(appointment.scheduledTime),
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        phone: appointment.patientPhone,
        name: appointment.patientName,
        visitType: appointment.visitType,
        scheduled_time: formatForInput(appointment.scheduledTime),
      });
    }
  }, [open, appointment, reset]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await updateAppointment({
        id: appointment.id,
        patientId: appointment.patientId,
        name: data.name,
        phone: data.phone,
        visitType: data.visitType,
        scheduled_time: data.scheduled_time ? new Date(data.scheduled_time).toISOString() : null,
      });
      toast.success("تم تحديث بيانات الحجز بنجاح");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء التحديث");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAppointment(appointment.id);
      toast.success("تم حذف الحجز بنجاح");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء الحذف");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right pr-6">تعديل بيانات الحجز</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          
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
            <Label htmlFor="edit-scheduled_time">موعد الحجز</Label>
            <Input
              id="edit-scheduled_time"
              type="datetime-local"
              dir="ltr"
              className="text-left block"
              {...register("scheduled_time")}
            />
            <p className="text-xs text-slate-500">اتركه فارغاً ليصبح مريضاً عادياً في الطابور</p>
          </div>

          <div className="pt-6 flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting}>
              <Save className="w-4 h-4" />
              حفظ التعديلات
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger 
                render={
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
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
