"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useUpdatePatient } from "@/hooks/useQueue";

const formSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  phone_number: z.string().min(11, "يجب أن يكون رقم الهاتف 11 رقماً").max(11, "رقم الهاتف غير صحيح"),
  national_id: z.string().optional(),
});

interface EditPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: {
    id: string;
    name: string;
    phone_number: string;
    national_id?: string | null;
  };
}

export function EditPatientModal({ open, onOpenChange, patient }: EditPatientModalProps) {
  const { mutateAsync: updatePatient } = useUpdatePatient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: patient.name,
      phone_number: patient.phone_number,
      national_id: patient.national_id || "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: patient.name,
        phone_number: patient.phone_number,
        national_id: patient.national_id || "",
      });
    }
  }, [open, patient, reset]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await updatePatient({
        id: patient.id,
        name: data.name,
        phone_number: data.phone_number,
        national_id: data.national_id || null,
      });
      
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        toast.warning("تم حفظ تعديلات المريض محلياً. سيتم المزامنة عند عودة الاتصال بالإنترنت.");
      } else {
        toast.success("تم تحديث بيانات المريض بنجاح");
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء التحديث");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right pr-6">تعديل بيانات المريض</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-patient-name">اسم المريض</Label>
            <Input id="edit-patient-name" placeholder="الاسم الثلاثي" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-patient-phone">رقم الهاتف</Label>
            <Input id="edit-patient-phone" placeholder="01xxxxxxxxx" dir="ltr" className="text-left" {...register("phone_number")} />
            {errors.phone_number && <p className="text-xs text-red-500">{errors.phone_number.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-patient-nid">الرقم القومي (اختياري)</Label>
            <Input id="edit-patient-nid" placeholder="الرقم القومي" dir="ltr" className="text-left" {...register("national_id")} />
          </div>

          <div className="pt-4 flex gap-2">
            <button
              type="button"
              className="flex-1 px-4 py-2 text-sm font-medium border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </button>
            <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting}>
              <Save className="w-4 h-4" />
              حفظ التعديلات
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
