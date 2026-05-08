"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || "فشل تسجيل الدخول. يرجى التحقق من بياناتك.");
    }
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
      if (!authData.session) throw new Error("يرجى إيقاف خاصية (Confirm Email) من إعدادات Supabase Authentication والمحاولة بإيميل جديد.");

      // 2. Insert clinic
      const clinic_id = crypto.randomUUID();
      const { error: clinicError } = await supabase
        .from("clinics")
        .insert({ id: clinic_id, name: clinicName, doctor_name: doctorName });
      
      if (clinicError) throw clinicError;

      // 3. Insert profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          clinic_id: clinic_id,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error("Signup Error:", error);
      toast.error(error.message || "حدث خطأ أثناء إنشاء الحساب. تأكد من صحة البيانات.");
    }
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

export function useProfile() {
  const supabase: any = createClient();
  
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });
}
