"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
});

export function AddPatientModal() {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
      name: "",
      visitType: "consultation",
    },
  });

  const { mutateAsync: addPatient } = useAddPatient();

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await addPatient(data);
      toast.success("تمت إضافة المريض للطابور بنجاح");
      setOpen(false);
      reset();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء الإضافة");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
        <Plus className="w-4 h-4" />
        إضافة مريض
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة مريض للطابور</DialogTitle>
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
            <Select onValueChange={(val: any) => setValue("visitType", val)} defaultValue="consultation">
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الكشف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">كشف جديد</SelectItem>
                <SelectItem value="follow_up">إعادة</SelectItem>
              </SelectContent>
            </Select>
            {errors.visitType && <p className="text-xs text-red-500">{errors.visitType.message}</p>}
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
