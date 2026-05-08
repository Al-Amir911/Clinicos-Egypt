"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

export function useQueue() {
   
  const supabase: any = createClient();
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["appointments"] });
          queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, supabase]);

  return useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          queue_number,
          status,
          visit_type,
          created_at,
          notified,
          prescription_url,
          scheduled_time,
          patient_id,
          patient:patients(name, phone_number)
        `)
        .order("scheduled_time", { ascending: true, nullsFirst: false })
        .order("queue_number", { ascending: true });

      if (error) throw error;

      // Filter to only show today's appointments:
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const todayEnd = todayStart + 24 * 60 * 60 * 1000;

      return (data || [])
        .filter((apt: any) => {
          if (apt.scheduled_time) {
            const st = new Date(apt.scheduled_time).getTime();
            return st >= todayStart && st < todayEnd;
          }
          // Walk-in: show if created today
          const ct = new Date(apt.created_at).getTime();
          return ct >= todayStart && ct < todayEnd;
        })
        .sort((a: any, b: any) => {
          const timeA = new Date(a.scheduled_time || a.created_at).getTime();
          const timeB = new Date(b.scheduled_time || b.created_at).getTime();
          return timeA - timeB;
        });
    },
  });
}

export function useScheduledAppointments() {
  const supabase: any = createClient();

  return useQuery({
    queryKey: ["scheduledAppointments"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          status,
          visit_type,
          scheduled_time,
          patient:patients(name, phone_number)
        `)
        .not("scheduled_time", "is", null)
        .order("scheduled_time", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useAddPatient() {
   
  const supabase: any = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ phone, name, visitType, scheduled_time }: { phone: string; name: string; visitType: "consultation" | "follow_up", scheduled_time?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get the clinic_id for this user
      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();
      
      const clinic_id = profile?.clinic_id;
      if (!clinic_id) throw new Error("No clinic associated with user");

      // 1. Find or create patient
      let patientId;
      const { data: existingPatient } = await supabase
        .from("patients")
        .select("id")
        .eq("phone_number", phone)
        .eq("clinic_id", clinic_id)
        .single();

      if (existingPatient) {
        patientId = existingPatient.id;
      } else {
        const { data: newPatient, error: patientError } = await supabase
          .from("patients")
          .insert({ name, phone_number: phone, clinic_id })
          .select()
          .single();
        
        if (patientError) throw patientError;
        patientId = newPatient.id;
      }

      // 2. Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          clinic_id,
          patient_id: patientId,
          visit_type: visitType,
          status: "waiting",
          scheduled_time: scheduled_time || null
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;
      return appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useUpdateAppointmentStatus() {
   
  const supabase: any = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "waiting" | "in_clinic" | "completed" }) => {
      const { data, error } = await supabase
        .from("appointments")
        .update({ 
          status,
          completed_at: status === "completed" ? new Date().toISOString() : null
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useLogPayment() {
  const supabase: any = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, amount, method }: { id: string; amount: number; method: "cash" | "instapay" }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();
      
      const clinic_id = profile?.clinic_id;
      if (!clinic_id) throw new Error("No clinic associated with user");

      // 1. Update appointment
      const { data: appointment, error: updateError } = await supabase
        .from("appointments")
        .update({ 
          status: "completed",
          completed_at: new Date().toISOString(),
          price: amount,
          is_paid: true,
          payment_method: method
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      // 2. Insert into payments table
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          clinic_id,
          appointment_id: id,
          amount,
          method
        });

      if (paymentError) throw paymentError;

      return appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      // Invalidate revenue query later if needed
    },
  });
}

export function useUploadPrescription() {
  const supabase: any = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      file, 
      appointmentId, 
      patientId 
    }: { 
      file: File; 
      appointmentId: string; 
      patientId: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();
      
      const clinic_id = profile?.clinic_id;
      if (!clinic_id) throw new Error("No clinic associated with user");

      // Upload to clinic-records bucket
      const filePath = `${clinic_id}/${patientId}/${appointmentId}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from("clinic-records")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("clinic-records")
        .getPublicUrl(filePath);

      // Update appointment
      const { data, error: updateError } = await supabase
        .from("appointments")
        .update({ prescription_url: publicUrl })
        .eq("id", appointmentId)
        .select()
        .single();

      if (updateError) throw updateError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useDailyStats() {
  const supabase: any = createClient();

  return useQuery({
    queryKey: ["dailyStats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();
      
      const clinic_id = profile?.clinic_id;
      if (!clinic_id) throw new Error("No clinic associated with user");

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfDay = today.toISOString();
      
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      const endOfDayISO = endOfDay.toISOString();

      // Fetch today's appointments
      const { data: appointments, error: apptError } = await supabase
        .from("appointments")
        .select("id, status, created_at, scheduled_time")
        .eq("clinic_id", clinic_id)
        .or(`created_at.gte.${startOfDay},scheduled_time.gte.${startOfDay}`);

      if (apptError) throw apptError;

      // Filter to exactly today
      const todayAppointments = (appointments || []).filter((apt: any) => {
        if (apt.scheduled_time) {
          const st = new Date(apt.scheduled_time).getTime();
          return st >= today.getTime() && st <= endOfDay.getTime();
        }
        const ct = new Date(apt.created_at).getTime();
        return ct >= today.getTime() && ct <= endOfDay.getTime();
      });

      // Fetch today's payments
      const { data: payments, error: paymentError } = await supabase
        .from("payments")
        .select("amount, method")
        .eq("clinic_id", clinic_id)
        .gte("created_at", startOfDay)
        .lte("created_at", endOfDayISO);

      if (paymentError) throw paymentError;

      const totalPatients = todayAppointments.length;
      const waitingPatients = todayAppointments.filter((a: any) => a.status === "waiting" || a.status === "in_clinic").length;
      
      const totalRevenue = payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
      const cashRevenue = payments?.filter((p: any) => p.method === "cash").reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
      const instapayRevenue = payments?.filter((p: any) => p.method === "instapay").reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;

      return {
        totalPatients,
        waitingPatients,
        totalRevenue,
        cashRevenue,
        instapayRevenue
      };
    },
  });
}

export function useSettings() {
  const supabase: any = createClient();

  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();
      
      const clinic_id = profile?.clinic_id;
      if (!clinic_id) throw new Error("No clinic associated with user");

      const { data, error } = await supabase
        .from("clinics")
        .select("*")
        .eq("id", clinic_id)
        .single();

      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateSettings() {
  const supabase: any = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ location_url }: { location_url: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();
      
      const clinic_id = profile?.clinic_id;
      if (!clinic_id) throw new Error("No clinic associated with user");

      const { data, error } = await supabase
        .from("clinics")
        .update({ location_url })
        .eq("id", clinic_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useUpdateAppointmentDetails() {
  const supabase: any = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      patientId,
      name, 
      phone, 
      visitType, 
      scheduled_time 
    }: { 
      id: string; 
      patientId: string;
      name?: string; 
      phone?: string; 
      visitType?: string; 
      scheduled_time?: string | null 
    }) => {
      // 1. Update patient info if provided
      if (name || phone) {
        const { error: patientError } = await supabase
          .from("patients")
          .update({ name, phone_number: phone })
          .eq("id", patientId);
        
        if (patientError) throw patientError;
      }

      // 2. Update appointment info
      const { data, error } = await supabase
        .from("appointments")
        .update({ 
          visit_type: visitType,
          scheduled_time: scheduled_time
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
    },
  });
}

export function useDeleteAppointment() {
  const supabase: any = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
    },
  });
}
