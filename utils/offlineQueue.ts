import { createClient } from "@/utils/supabase/client";

export interface OfflineAppointment {
  id: string;
  queue_number: number;
  status: "waiting" | "in_clinic" | "completed";
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
  price?: number;
  is_paid?: boolean;
  payment_method?: "cash" | "instapay";
}

export interface OfflineEdit {
  id: string; // appointment ID
  patientId: string;
  name?: string;
  phone?: string;
  visitType?: "consultation" | "follow_up";
  scheduled_time?: string | null;
}

export interface OfflineStatusUpdate {
  id: string;
  status: "waiting" | "in_clinic" | "completed";
  completed_at?: string | null;
}

export interface OfflinePayment {
  appointmentId: string;
  amount: number;
  method: "cash" | "instapay";
  created_at: string;
}

export interface OfflinePatientEdit {
  id: string; // patient ID
  name: string;
  phone_number: string;
  national_id?: string | null;
}

const KEYS = {
  ADDITIONS: "clinicos_offline_appointments",
  DELETIONS: "clinicos_offline_deletions",
  EDITS: "clinicos_offline_edits",
  STATUS_UPDATES: "clinicos_offline_status_updates",
  PAYMENTS: "clinicos_offline_payments",
  PATIENT_EDITS: "clinicos_offline_patient_edits",
};

// --- GETTERS & SAVERS ---

export function getOfflineAppointments(): OfflineAppointment[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(KEYS.ADDITIONS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading offline queue additions:", e);
    return [];
  }
}

export function saveOfflineAppointments(appts: OfflineAppointment[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEYS.ADDITIONS, JSON.stringify(appts));
  } catch (e) {
    console.error("Error saving offline queue additions:", e);
  }
}

export function getOfflineDeletions(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(KEYS.DELETIONS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading offline deletions:", e);
    return [];
  }
}

export function saveOfflineDeletions(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEYS.DELETIONS, JSON.stringify(ids));
  } catch (e) {
    console.error("Error saving offline deletions:", e);
  }
}

export function getOfflineEdits(): OfflineEdit[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(KEYS.EDITS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading offline edits:", e);
    return [];
  }
}

export function saveOfflineEdits(edits: OfflineEdit[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEYS.EDITS, JSON.stringify(edits));
  } catch (e) {
    console.error("Error saving offline edits:", e);
  }
}

export function getOfflineStatusUpdates(): OfflineStatusUpdate[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(KEYS.STATUS_UPDATES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading offline status updates:", e);
    return [];
  }
}

export function saveOfflineStatusUpdates(updates: OfflineStatusUpdate[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEYS.STATUS_UPDATES, JSON.stringify(updates));
  } catch (e) {
    console.error("Error saving offline status updates:", e);
  }
}

export function getOfflinePayments(): OfflinePayment[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(KEYS.PAYMENTS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading offline payments:", e);
    return [];
  }
}

export function saveOfflinePayments(payments: OfflinePayment[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(payments));
  } catch (e) {
    console.error("Error saving offline payments:", e);
  }
}

export function getOfflinePatientEdits(): OfflinePatientEdit[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(KEYS.PATIENT_EDITS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading offline patient edits:", e);
    return [];
  }
}

export function saveOfflinePatientEdits(edits: OfflinePatientEdit[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEYS.PATIENT_EDITS, JSON.stringify(edits));
  } catch (e) {
    console.error("Error saving offline patient edits:", e);
  }
}

// --- ADDERS & MUTATORS ---

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

export function updateOfflineAppointmentStatus(id: string, status: "waiting" | "in_clinic" | "completed") {
  const queue = getOfflineAppointments();
  const idx = queue.findIndex(a => a.id === id);
  if (idx !== -1) {
    queue[idx].status = status;
    saveOfflineAppointments(queue);
    return true;
  }
  return false;
}

export function updateOfflineAppointmentDetails(
  id: string,
  name?: string,
  phone?: string,
  visitType?: "consultation" | "follow_up",
  scheduledTime?: string | null
) {
  const queue = getOfflineAppointments();
  const idx = queue.findIndex(a => a.id === id);
  if (idx !== -1) {
    if (name !== undefined) queue[idx].patient.name = name;
    if (phone !== undefined) queue[idx].patient.phone_number = phone;
    if (visitType !== undefined) queue[idx].visit_type = visitType;
    if (scheduledTime !== undefined) queue[idx].scheduled_time = scheduledTime;
    saveOfflineAppointments(queue);
    return true;
  }
  return false;
}

export function logOfflinePayment(id: string, amount: number, method: "cash" | "instapay") {
  const queue = getOfflineAppointments();
  const idx = queue.findIndex(a => a.id === id);
  if (idx !== -1) {
    queue[idx].status = "completed";
    queue[idx].price = amount;
    queue[idx].is_paid = true;
    queue[idx].payment_method = method;
    saveOfflineAppointments(queue);
    return true;
  }
  return false;
}

export function deleteOfflineAppointmentLocal(id: string) {
  const queue = getOfflineAppointments();
  const filtered = queue.filter(a => a.id !== id);
  if (filtered.length !== queue.length) {
    saveOfflineAppointments(filtered);
    return true;
  }
  return false;
}

// Helpers for existing (server-side) items
function removePendingEditsAndStatusUpdatesForAppt(id: string) {
  const edits = getOfflineEdits().filter(e => e.id !== id);
  saveOfflineEdits(edits);

  const statusUpdates = getOfflineStatusUpdates().filter(u => u.id !== id);
  saveOfflineStatusUpdates(statusUpdates);

  const payments = getOfflinePayments().filter(p => p.appointmentId !== id);
  saveOfflinePayments(payments);
}

export function addOfflineDeletion(id: string) {
  removePendingEditsAndStatusUpdatesForAppt(id);
  const deletions = getOfflineDeletions();
  if (!deletions.includes(id)) {
    deletions.push(id);
    saveOfflineDeletions(deletions);
  }
}

export function addOfflineEdit(edit: OfflineEdit) {
  const edits = getOfflineEdits();
  const idx = edits.findIndex(e => e.id === edit.id);
  if (idx !== -1) {
    edits[idx] = { ...edits[idx], ...edit };
  } else {
    edits.push(edit);
  }
  saveOfflineEdits(edits);
}

export function addOfflineStatusUpdate(update: OfflineStatusUpdate) {
  const updates = getOfflineStatusUpdates();
  const idx = updates.findIndex(u => u.id === update.id);
  if (idx !== -1) {
    updates[idx] = { ...updates[idx], ...update };
  } else {
    updates.push(update);
  }
  saveOfflineStatusUpdates(updates);
}

export function addOfflinePayment(pay: OfflinePayment) {
  const payments = getOfflinePayments();
  payments.push(pay);
  saveOfflinePayments(payments);
}

export function addOfflinePatientEdit(edit: OfflinePatientEdit) {
  const edits = getOfflinePatientEdits();
  const idx = edits.findIndex(e => e.id === edit.id);
  if (idx !== -1) {
    edits[idx] = { ...edits[idx], ...edit };
  } else {
    edits.push(edit);
  }
  saveOfflinePatientEdits(edits);
}

// --- SYNCHRONIZATION ENGINE ---

export async function syncOfflineAppointments() {
  const hasAdditions = getOfflineAppointments().length > 0;
  const hasDeletions = getOfflineDeletions().length > 0;
  const hasEdits = getOfflineEdits().length > 0;
  const hasStatusUpdates = getOfflineStatusUpdates().length > 0;
  const hasPayments = getOfflinePayments().length > 0;
  const hasPatientEdits = getOfflinePatientEdits().length > 0;

  if (!hasAdditions && !hasDeletions && !hasEdits && !hasStatusUpdates && !hasPayments && !hasPatientEdits) {
    return;
  }

  const supabase: any = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("clinic_id")
    .eq("id", user.id)
    .single() as any;

  const clinic_id = profile?.clinic_id;
  if (!clinic_id) return;

  console.log("Starting chronological background sync...");

  // 1. Sync additions (clinicos_offline_appointments)
  const additions = getOfflineAppointments();
  for (const appt of additions) {
    try {
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

      const isCompleted = appt.status === "completed";
      const { data: newAppt, error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          clinic_id,
          patient_id: patientId,
          visit_type: appt.visit_type,
          status: appt.status,
          scheduled_time: appt.scheduled_time,
          completed_at: isCompleted ? (appt.created_at || new Date().toISOString()) : null,
          price: isCompleted ? appt.price : null,
          is_paid: isCompleted ? appt.is_paid : null,
          payment_method: isCompleted ? appt.payment_method : null,
        })
        .select()
        .single() as any;

      if (appointmentError) throw appointmentError;

      if (isCompleted && appt.price) {
        const { error: paymentError } = await supabase
          .from("payments")
          .insert({
            clinic_id,
            appointment_id: newAppt.id,
            amount: appt.price,
            method: appt.payment_method,
            created_at: appt.created_at || new Date().toISOString(),
          });
        if (paymentError) throw paymentError;
      }
    } catch (err) {
      console.error("Failed to sync additions:", appt, err);
      throw err;
    }
  }
  saveOfflineAppointments([]);

  // 2. Sync patient edits (clinicos_offline_patient_edits)
  const patientEdits = getOfflinePatientEdits();
  for (const edit of patientEdits) {
    try {
      const { error } = await supabase
        .from("patients")
        .update({
          name: edit.name,
          phone_number: edit.phone_number,
          national_id: edit.national_id,
        })
        .eq("id", edit.id);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to sync patient edit:", edit, err);
    }
  }
  saveOfflinePatientEdits([]);

  // 3. Sync appointment edits (clinicos_offline_edits)
  const edits = getOfflineEdits();
  for (const edit of edits) {
    try {
      if (edit.name || edit.phone) {
        const { error: patError } = await supabase
          .from("patients")
          .update({
            name: edit.name,
            phone_number: edit.phone,
          })
          .eq("id", edit.patientId);
        if (patError) throw patError;
      }

      const { error: apptError } = await supabase
        .from("appointments")
        .update({
          visit_type: edit.visitType,
          scheduled_time: edit.scheduled_time,
        })
        .eq("id", edit.id);
      if (apptError) throw apptError;
    } catch (err) {
      console.error("Failed to sync appointment edit:", edit, err);
    }
  }
  saveOfflineEdits([]);

  // 4. Sync status updates (clinicos_offline_status_updates)
  const statusUpdates = getOfflineStatusUpdates();
  for (const update of statusUpdates) {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({
          status: update.status,
          completed_at: update.completed_at,
        })
        .eq("id", update.id);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to sync status update:", update, err);
    }
  }
  saveOfflineStatusUpdates([]);

  // 5. Sync payments (clinicos_offline_payments)
  const payments = getOfflinePayments();
  for (const pay of payments) {
    try {
      const { error: apptError } = await supabase
        .from("appointments")
        .update({
          status: "completed",
          completed_at: pay.created_at,
          price: pay.amount,
          is_paid: true,
          payment_method: pay.method,
        })
        .eq("id", pay.appointmentId);
      if (apptError) throw apptError;

      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          clinic_id,
          appointment_id: pay.appointmentId,
          amount: pay.amount,
          method: pay.method,
          created_at: pay.created_at,
        });
      if (paymentError) throw paymentError;
    } catch (err) {
      console.error("Failed to sync payment:", pay, err);
    }
  }
  saveOfflinePayments([]);

  // 6. Sync deletions (clinicos_offline_deletions)
  const deletions = getOfflineDeletions();
  for (const id of deletions) {
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to sync deletion:", id, err);
    }
  }
  saveOfflineDeletions([]);

  console.log("Background sync finished successfully!");
}
