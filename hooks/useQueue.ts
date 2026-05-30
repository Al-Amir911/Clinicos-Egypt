"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import {
  getOfflineAppointments,
  addOfflineAppointment,
  updateOfflineAppointmentStatus,
  updateOfflineAppointmentDetails,
  logOfflinePayment,
  deleteOfflineAppointmentLocal,
  addOfflineDeletion,
  addOfflineEdit,
  addOfflineStatusUpdate,
  addOfflinePayment,
  addOfflinePatientEdit,
  getOfflineDeletions,
  getOfflineEdits,
  getOfflineStatusUpdates,
  getOfflinePayments,
  getOfflinePatientEdits,
} from "@/utils/offlineQueue";

export function useQueue() {
  const supabase: any = createClient();
  const queryClient = useQueryClient();

  // Removed the local supabase.channel subscription as it creates multiple conflicting channels
  // and relies on Supabase Realtime being manually enabled on the tables.
  // Instead, we will use robust polling (refetchInterval) on the queries below.

  // 1. Base server-only query
  const serverQuery = useQuery({
    queryKey: ["appointmentsServer"],
    networkMode: "always",
    refetchInterval: 3000,
    queryFn: async () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return queryClient.getQueryData(["appointmentsServer"]) || [];
      }

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const todayEnd = todayStart + 24 * 60 * 60 * 1000;

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
          price,
          is_paid,
          payment_method,
          patient:patients(name, phone_number)
        `)
        .order("scheduled_time", { ascending: true, nullsFirst: false })
        .order("queue_number", { ascending: true });

      if (error) throw error;

      return (data || []).filter((apt: any) => {
        if (apt.scheduled_time) {
          const st = new Date(apt.scheduled_time).getTime();
          return st >= todayStart && st < todayEnd;
        }
        const ct = new Date(apt.created_at).getTime();
        return ct >= todayStart && ct < todayEnd;
      });
    }
  });

  // 2. Merged UI query
  return useQuery({
    queryKey: ["appointments", serverQuery.data],
    networkMode: "always",
    queryFn: async () => {
      const serverAppts = (serverQuery.data as any[]) || [];

      // --- MERGE OFFLINE CHANGES ---
      const offlineAdditions = getOfflineAppointments();
      const offlineDeletions = getOfflineDeletions();
      const offlineEdits = getOfflineEdits();
      const offlineStatusUpdates = getOfflineStatusUpdates();

      // 1. Filter out deleted server appointments
      let merged = serverAppts.filter((apt: any) => !offlineDeletions.includes(apt.id));

      // 2. Apply status updates to server appointments
      merged = merged.map((apt: any) => {
        const update = offlineStatusUpdates.find((u) => u.id === apt.id);
        if (update) {
          return { ...apt, status: update.status };
        }
        return apt;
      });

      // 3. Apply edits to server appointments
      merged = merged.map((apt: any) => {
        const edit = offlineEdits.find((e) => e.id === apt.id);
        if (edit) {
          return {
            ...apt,
            visit_type: edit.visitType !== undefined ? edit.visitType : apt.visit_type,
            scheduled_time: edit.scheduled_time !== undefined ? edit.scheduled_time : apt.scheduled_time,
            patient: {
              ...apt.patient,
              name: edit.name !== undefined ? edit.name : apt.patient?.name,
              phone_number: edit.phone !== undefined ? edit.phone : apt.patient?.phone_number,
            },
          };
        }
        return apt;
      });

      // 4. Prepend offline additions and sort everything chronologically
      const finalQueue = [...offlineAdditions, ...merged].sort((a: any, b: any) => {
        const timeA = new Date(a.scheduled_time || a.created_at).getTime();
        const timeB = new Date(b.scheduled_time || b.created_at).getTime();
        return timeA - timeB;
      });

      return finalQueue;
    },
  });
}

export function useScheduledAppointments() {
  const supabase: any = createClient();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["scheduledAppointments"],
    networkMode: "always",
    refetchInterval: 5000,
    queryFn: async () => {
      try {
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          throw new Error("Offline status detected");
        }

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
      } catch (err) {
        console.warn("useScheduledAppointments offline fallback triggered:", err);
        const cachedData: any = queryClient.getQueryData(["scheduledAppointments"]) || [];
        return cachedData;
      }
    },
  });
}

export function useAddPatient() {
  const supabase: any = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    networkMode: "always",
    mutationFn: async ({ phone, name, visitType, scheduled_time }: { phone: string; name: string; visitType: "consultation" | "follow_up", scheduled_time?: string }) => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        const newOfflineAppt = addOfflineAppointment(name, phone, visitType, scheduled_time);
        return newOfflineAppt;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile }: any = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      const clinic_id = profile?.clinic_id;
      if (!clinic_id) throw new Error("No clinic associated with user");

      let patientId;
      const { data: existingPatient }: any = await supabase
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
      // Optimistic update: immediately patch the cached stats for instant UI feedback
      const currentStats = queryClient.getQueryData<any>(["dailyStatsServer"]);
      if (currentStats) {
        queryClient.setQueryData(["dailyStatsServer"], {
          ...currentStats,
          totalPatients: currentStats.totalPatients + 1,
          waitingPatients: currentStats.waitingPatients + 1,
        });
      }

      // Background refetch for authoritative server data
      queryClient.invalidateQueries({ queryKey: ["appointmentsServer"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStatsServer"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const supabase: any = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    networkMode: "always",
    mutationFn: async ({ id, status }: { id: string; status: "waiting" | "in_clinic" | "completed" }) => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        const wasTemp = updateOfflineAppointmentStatus(id, status);
        if (!wasTemp) {
          addOfflineStatusUpdate({
            id,
            status,
            completed_at: status === "completed" ? new Date().toISOString() : null,
          });
        }
        return { id, status };
      }

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
    onSuccess: (_data, variables) => {
      // Optimistic update: immediately patch the cached stats for instant UI feedback
      const currentStats = queryClient.getQueryData<any>(["dailyStatsServer"]);
      if (currentStats) {
        const wasWaitingOrInClinic = variables.status === "completed";
        queryClient.setQueryData(["dailyStatsServer"], {
          ...currentStats,
          waitingPatients: wasWaitingOrInClinic
            ? Math.max(0, currentStats.waitingPatients - 1)
            : currentStats.waitingPatients,
        });
      }

      // Optimistic update: patch the appointment in the cached server appointments list
      const cachedAppts = queryClient.getQueryData<any[]>(["appointmentsServer"]);
      if (cachedAppts) {
        queryClient.setQueryData(
          ["appointmentsServer"],
          cachedAppts.map((apt: any) =>
            apt.id === variables.id ? { ...apt, status: variables.status } : apt
          )
        );
      }

      // Background refetch for authoritative server data
      queryClient.invalidateQueries({ queryKey: ["appointmentsServer"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStatsServer"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
    },
  });
}

export function useLogPayment() {
  const supabase: any = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    networkMode: "always",
    mutationFn: async ({ id, amount, method }: { id: string; amount: number; method: "cash" | "instapay" }) => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        const wasTemp = logOfflinePayment(id, amount, method);
        if (!wasTemp) {
          addOfflineStatusUpdate({
            id,
            status: "completed",
            completed_at: new Date().toISOString(),
          });
          addOfflinePayment({
            appointmentId: id,
            amount,
            method,
            created_at: new Date().toISOString(),
          });
        }
        return { id, status: "completed", price: amount, is_paid: true, payment_method: method };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile }: any = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      const clinic_id = profile?.clinic_id;
      if (!clinic_id) throw new Error("No clinic associated with user");

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
    onSuccess: (_data, variables) => {
      // Optimistic update: immediately patch the revenue stats for instant UI feedback
      const currentStats = queryClient.getQueryData<any>(["dailyStatsServer"]);
      if (currentStats) {
        queryClient.setQueryData(["dailyStatsServer"], {
          ...currentStats,
          waitingPatients: Math.max(0, currentStats.waitingPatients - 1),
          totalRevenue: currentStats.totalRevenue + variables.amount,
          cashRevenue: currentStats.cashRevenue + (variables.method === "cash" ? variables.amount : 0),
          instapayRevenue: currentStats.instapayRevenue + (variables.method === "instapay" ? variables.amount : 0),
        });
      }

      // Optimistic update: patch the appointment in the cached server appointments list
      const cachedAppts = queryClient.getQueryData<any[]>(["appointmentsServer"]);
      if (cachedAppts) {
        queryClient.setQueryData(
          ["appointmentsServer"],
          cachedAppts.map((apt: any) =>
            apt.id === variables.id
              ? { ...apt, status: "completed", price: variables.amount, is_paid: true, payment_method: variables.method }
              : apt
          )
        );
      }

      // Background refetch for authoritative server data
      queryClient.invalidateQueries({ queryKey: ["appointmentsServer"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStatsServer"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
    },
  });
}

export function useUploadPrescription() {
  const supabase: any = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    networkMode: "always",
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

      const { data: profile }: any = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      const clinic_id = profile?.clinic_id;
      if (!clinic_id) throw new Error("No clinic associated with user");

      const filePath = `${clinic_id}/${patientId}/${appointmentId}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("clinic-records")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("clinic-records")
        .getPublicUrl(filePath);

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
      queryClient.invalidateQueries({ queryKey: ["appointmentsServer"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useDailyStats() {
  const supabase: any = createClient();
  const queryClient = useQueryClient();

  // 1. Base server stats query
  const serverStatsQuery = useQuery({
    queryKey: ["dailyStatsServer"],
    networkMode: "always",
    refetchInterval: 5000,
    queryFn: async () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return queryClient.getQueryData(["dailyStatsServer"]) || {
          totalPatients: 0,
          waitingPatients: 0,
          totalRevenue: 0,
          cashRevenue: 0,
          instapayRevenue: 0,
        };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile }: any = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      const clinic_id = profile?.clinic_id;
      if (!clinic_id) throw new Error("No clinic associated with user");

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfDay = today.toISOString();
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      const endOfDayISO = endOfDay.toISOString();

      const { data: todayAppointments, error: apptError }: any = await supabase
        .from("appointments")
        .select("id, status")
        .eq("clinic_id", clinic_id)
        .or(`and(scheduled_time.is.null,created_at.gte.${startOfDay},created_at.lte.${endOfDayISO}),and(scheduled_time.gte.${startOfDay},scheduled_time.lte.${endOfDayISO})`);

      if (apptError) throw apptError;

      const { data: payments, error: paymentError }: any = await supabase
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
    }
  });

  // 2. Merged UI stats query
  return useQuery({
    queryKey: ["dailyStats", serverStatsQuery.data],
    networkMode: "always",
    queryFn: async () => {
      const stats: any = serverStatsQuery.data || {
        totalPatients: 0,
        waitingPatients: 0,
        totalRevenue: 0,
        cashRevenue: 0,
        instapayRevenue: 0,
      };

      // --- MERGE OFFLINE ADDITIONS AND PAYMENTS INTO STATS ---
      const additions = getOfflineAppointments();
      const deletions = getOfflineDeletions();
      const statusUpdates = getOfflineStatusUpdates();
      const offlinePayments = getOfflinePayments();

      let offlineTotalAdditions = 0;
      let offlineWaitingAdditions = 0;
      let offlineAddedRevenue = 0;
      let offlineAddedCash = 0;
      let offlineAddedInstapay = 0;

      additions.forEach((appt) => {
        offlineTotalAdditions += 1;
        if (appt.status === "waiting" || appt.status === "in_clinic") {
          offlineWaitingAdditions += 1;
        } else if (appt.status === "completed" && appt.price) {
          offlineAddedRevenue += appt.price;
          if (appt.payment_method === "cash") {
            offlineAddedCash += appt.price;
          } else if (appt.payment_method === "instapay") {
            offlineAddedInstapay += appt.price;
          }
        }
      });

      // Get server appointments to compute adjustments accurately
      const serverAppts = queryClient.getQueryData<any[]>(["appointmentsServer"]) || [];

      let serverWaitingCountAdjustment = 0;
      let serverTotalCountAdjustment = 0;
      let serverRevenueAdjustment = 0;
      let serverCashAdjustment = 0;
      let serverInstapayAdjustment = 0;

      serverAppts.forEach((appt) => {
        const isDeletedOffline = deletions.includes(appt.id);
        const originalIsWaiting = appt.status === "waiting" || appt.status === "in_clinic";

        if (isDeletedOffline) {
          serverTotalCountAdjustment -= 1;
          if (originalIsWaiting) {
            serverWaitingCountAdjustment -= 1;
          } else if (appt.status === "completed" && appt.price) {
            // Subtract price from revenue adjustments if the deleted server appointment was completed
            serverRevenueAdjustment -= Number(appt.price);
            if (appt.payment_method === "cash") {
              serverCashAdjustment -= Number(appt.price);
            } else if (appt.payment_method === "instapay") {
              serverInstapayAdjustment -= Number(appt.price);
            }
          }
        } else {
          const statusUpdate = statusUpdates.find(u => u.id === appt.id);
          if (statusUpdate) {
            const newIsWaiting = statusUpdate.status === "waiting" || statusUpdate.status === "in_clinic";
            if (originalIsWaiting && !newIsWaiting) {
              serverWaitingCountAdjustment -= 1;
            } else if (!originalIsWaiting && newIsWaiting) {
              serverWaitingCountAdjustment += 1;
            }
          }
        }
      });

      let offlineServerPaymentRevenue = 0;
      let offlineServerPaymentCash = 0;
      let offlineServerPaymentInstapay = 0;

      offlinePayments.forEach((pay) => {
        offlineServerPaymentRevenue += pay.amount;
        if (pay.method === "cash") {
          offlineServerPaymentCash += pay.amount;
        } else if (pay.method === "instapay") {
          offlineServerPaymentInstapay += pay.amount;
        }
      });

      return {
        totalPatients: Math.max(0, stats.totalPatients + offlineTotalAdditions + serverTotalCountAdjustment),
        waitingPatients: Math.max(0, stats.waitingPatients + offlineWaitingAdditions + serverWaitingCountAdjustment),
        totalRevenue: Math.max(0, stats.totalRevenue + offlineAddedRevenue + offlineServerPaymentRevenue + serverRevenueAdjustment),
        cashRevenue: Math.max(0, stats.cashRevenue + offlineAddedCash + offlineServerPaymentCash + serverCashAdjustment),
        instapayRevenue: Math.max(0, stats.instapayRevenue + offlineAddedInstapay + offlineServerPaymentInstapay + serverInstapayAdjustment),
      };
    },
  });
}

export function useSettings() {
  const supabase: any = createClient();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["settings"],
    networkMode: "always",
    queryFn: async () => {
      try {
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          throw new Error("Offline status detected");
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data: profile }: any = await supabase
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
      } catch (err) {
        console.warn("useSettings offline fallback triggered:", err);
        const cached: any = queryClient.getQueryData(["settings"]);
        return cached || null;
      }
    },
  });
}

export function useUpdateSettings() {
  const supabase: any = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    networkMode: "always",
    mutationFn: async ({ location_url, working_hours_start, working_hours_end, slot_duration }: { location_url: string, working_hours_start: string, working_hours_end: string, slot_duration?: number }) => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        throw new Error("لا يمكن تعديل الإعدادات في وضع عدم الاتصال بالإنترنت.");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile }: any = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      const clinic_id = profile?.clinic_id;
      if (!clinic_id) throw new Error("No clinic associated with user");

      const { data, error } = await supabase
        .from("clinics")
        .update({ location_url, working_hours_start, working_hours_end, slot_duration })
        .eq("id", clinic_id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("لم يتم العثور على العيادة أو لا تملك صلاحية التعديل. تأكد من إعدادات الـ RLS في Supabase.");
      }

      return data[0];
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
    networkMode: "always",
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
      visitType?: any;
      scheduled_time?: string | null
    }) => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        const wasTemp = updateOfflineAppointmentDetails(id, name, phone, visitType, scheduled_time);
        if (!wasTemp) {
          addOfflineEdit({
            id,
            patientId,
            name,
            phone,
            visitType,
            scheduled_time,
          });
        }
        return { id, patientId, name, phone, visitType, scheduled_time };
      }

      const { data: originalPatient }: any = await supabase
        .from("patients")
        .select("name, phone_number")
        .eq("id", patientId)
        .single();

      if (name || phone) {
        const { error: patientError } = await supabase
          .from("patients")
          .update({ name, phone_number: phone })
          .eq("id", patientId);

        if (patientError) throw patientError;
      }

      const { data, error } = await supabase
        .from("appointments")
        .update({
          visit_type: visitType,
          scheduled_time: scheduled_time
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (originalPatient && (name || phone)) {
          await supabase
            .from("patients")
            .update({ name: originalPatient.name, phone_number: originalPatient.phone_number })
            .eq("id", patientId);
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointmentsServer"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStatsServer"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
    },
  });
}

export function useDeleteAppointment() {
  const supabase: any = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    networkMode: "always",
    mutationFn: async (id: string) => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        const wasTemp = deleteOfflineAppointmentLocal(id);
        if (!wasTemp) {
          addOfflineDeletion(id);
        }
        return { id };
      }

      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointmentsServer"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStatsServer"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
    },
  });
}

export function useUpdatePatient() {
  const supabase: any = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    networkMode: "always",
    mutationFn: async ({ id, name, phone_number, national_id }: { id: string; name: string; phone_number: string; national_id?: string | null }) => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        addOfflinePatientEdit({ id, name, phone_number, national_id });
        return { id, name, phone_number, national_id };
      }

      const { data, error } = await supabase
        .from("patients")
        .update({ name, phone_number, national_id })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPatientsServer"] });
      queryClient.invalidateQueries({ queryKey: ["allPatients"] });
      queryClient.invalidateQueries({ queryKey: ["appointmentsServer"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}
