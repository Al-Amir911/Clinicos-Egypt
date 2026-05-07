"use client";

import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useAuth() {
  const supabase: any = createClient();
  const router = useRouter();

  const signIn = useMutation({
    mutationFn: async ({ email, password }: any) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("تم تسجيل الدخول بنجاح");
      router.push("/");
    },
  });

  const signUp = useMutation({
    mutationFn: async ({ email, password, clinicName, doctorName, fullName }: any) => {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password 
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("فشل إنشاء الحساب");

      // 2. Insert clinic
      const { data: clinicData, error: clinicError } = await supabase
        .from("clinics")
        .insert({ name: clinicName, doctor_name: doctorName })
        .select()
        .single();
      
      if (clinicError) throw clinicError;

      // 3. Insert profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          clinic_id: clinicData.id,
          role: "doctor",
          full_name: fullName
        });

      if (profileError) throw profileError;
      return authData;
    },
    onSuccess: () => {
      toast.success("تم إنشاء الحساب بنجاح! جاري التوجيه...");
      router.push("/");
    },
  });

  const signOut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      router.push("/login");
    }
  });

  return { signIn, signUp, signOut };
}
