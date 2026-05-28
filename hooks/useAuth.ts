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
      router.push("/dashboard");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || "فشل تسجيل الدخول. يرجى التحقق من بياناتك.");
    }
  });

  const signUp = useMutation({
    mutationFn: async ({ email, password, clinicName, doctorName, fullName, adminPassword }: any) => {
      // Send registration request to our server-side API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          clinicName,
          doctorName,
          fullName,
          adminPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "حدث خطأ أثناء إنشاء الحساب");
      }

      // Automatically sign in client-side to establish the session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      return signInData;
    },
    onSuccess: () => {
      toast.success("تم إنشاء الحساب بنجاح! جاري التوجيه...");
      router.push("/dashboard");
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
