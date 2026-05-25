import { createClient } from "@/utils/supabase/client";

export interface OfflineAppointment {
  id: string;
  queue_number: number;
  status: "waiting";
  visit_type: "consultation" | "follow_up";
  created_at: string;
  scheduled_time: string | null;
  notified: boolean;
  prescription_url: null;
  patient_id: string;
  patient: {
    name: string;
    phone_number: string;
  };
  isOfflineTemp: boolean;
}

const LOCAL_STORAGE_KEY = "clinicos_offline_appointments";

export function getOfflineAppointments(): OfflineAppointment[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading offline queue:", e);
    return [];
  }
}

export function saveOfflineAppointments(appts: OfflineAppointment[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appts));
  } catch (e) {
    console.error("Error saving offline queue:", e);
  }
}

export function addOfflineAppointment(
  name: string,
  phone: string,
  visitType: "consultation" | "follow_up",
  scheduledTime?: string
): OfflineAppointment {
  const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const newAppt: OfflineAppointment = {
    id: tempId,
    queue_number: 999, // Temp placeholder
    status: "waiting",
    visit_type: visitType,
    created_at: new Date().toISOString(),
    scheduled_time: scheduledTime || null,
    notified: false,
    prescription_url: null,
    patient_id: `temp-pat-${tempId}`,
    patient: {
      name,
      phone_number: phone,
    },
    isOfflineTemp: true,
  };

  const queue = getOfflineAppointments();
  queue.push(newAppt);
  saveOfflineAppointments(queue);
  return newAppt;
}

export async function syncOfflineAppointments() {
  const queue = getOfflineAppointments();
  if (queue.length === 0) return;

  const supabase: any = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Get clinic_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("clinic_id")
    .eq("id", user.id)
    .single() as any;

  const clinic_id = profile?.clinic_id;
  if (!clinic_id) return;

  console.log(`Syncing ${queue.length} offline appointments...`);
  
  for (const appt of queue) {
    try {
      // 1. Find or create patient
      let patientId;
      const { data: existingPatient } = await supabase
        .from("patients")
        .select("id")
        .eq("phone_number", appt.patient.phone_number)
        .eq("clinic_id", clinic_id)
        .single() as any;

      if (existingPatient) {
        patientId = existingPatient.id;
      } else {
        const { data: newPatient, error: patientError } = await supabase
          .from("patients")
          .insert({
            name: appt.patient.name,
            phone_number: appt.patient.phone_number,
            clinic_id,
          })
          .select()
          .single() as any;

        if (patientError) throw patientError;
        patientId = newPatient.id;
      }

      // 2. Create appointment
      const { error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          clinic_id,
          patient_id: patientId,
          visit_type: appt.visit_type,
          status: "waiting",
          scheduled_time: appt.scheduled_time,
        });

      if (appointmentError) throw appointmentError;
    } catch (err) {
      console.error("Failed to sync offline appointment:", appt, err);
      // Keep in queue for next retry if it failed
      throw err;
    }
  }

  // Clear local queue upon successful sync
  saveOfflineAppointments([]);
}
