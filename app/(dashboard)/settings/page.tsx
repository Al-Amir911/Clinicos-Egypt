"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSettings, useUpdateSettings } from "@/hooks/useQueue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  location_url: z.string().url("رابط خريطة غير صحيح").optional().or(z.literal("")),
  working_hours_start: z.string().min(1, "مطلوب"),
  working_hours_end: z.string().min(1, "مطلوب"),
});

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const { mutateAsync: updateSettings, isPending } = useUpdateSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location_url: "",
      working_hours_start: "09:00",
      working_hours_end: "18:00",
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        location_url: settings.location_url || "",
        working_hours_start: settings.working_hours_start || "09:00",
        working_hours_end: settings.working_hours_end || "18:00",
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await updateSettings({ 
        location_url: data.location_url || "",
        working_hours_start: data.working_hours_start,
        working_hours_end: data.working_hours_end,
      });
      toast.success("تم تحديث الإعدادات بنجاح");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء التحديث");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إعدادات العيادة</h1>
          <p className="text-slate-500 text-sm">تخصيص بيانات العيادة ورسائل التواصل</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5 text-primary" />
            الموقع الجغرافي (Google Maps)
          </CardTitle>
          <CardDescription>
            سيتم إرفاق هذا الرابط تلقائياً في رسائل الواتساب المرسلة للمرضى عند تأكيد الحجز.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location_url">رابط خرائط جوجل</Label>
              <Input
                id="location_url"
                placeholder="https://maps.google.com/..."
                dir="ltr"
                className="text-left"
                {...register("location_url")}
              />
              {errors.location_url && (
                <p className="text-xs text-red-500">{errors.location_url.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="working_hours_start">بداية العمل</Label>
                <Input
                  id="working_hours_start"
                  type="time"
                  {...register("working_hours_start")}
                />
                {errors.working_hours_start && (
                  <p className="text-xs text-red-500">{errors.working_hours_start.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="working_hours_end">نهاية العمل</Label>
                <Input
                  id="working_hours_end"
                  type="time"
                  {...register("working_hours_end")}
                />
                {errors.working_hours_end && (
                  <p className="text-xs text-red-500">{errors.working_hours_end.message}</p>
                )}
              </div>
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              حفظ التغييرات
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
