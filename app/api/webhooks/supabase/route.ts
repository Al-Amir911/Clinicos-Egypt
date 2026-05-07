import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWhatsAppMessage } from "@/utils/evolution";
import { Database } from "@/types/supabase";

// Create a Supabase client with the Service Role key to bypass RLS
// in this secure backend context.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Only process updates on the appointments table
    if (payload.table !== "appointments" || payload.type !== "UPDATE") {
      return NextResponse.json({ message: "Ignored" });
    }

    const { record, old_record } = payload;

    // Check if the appointment just transitioned to 'in_clinic'
    const justEnteredClinic = 
      old_record.status !== "in_clinic" && 
      record.status === "in_clinic";

    if (!justEnteredClinic) {
      return NextResponse.json({ message: "No relevant state change" });
    }

    // A patient went in. Find the NEXT patient in the queue.
    const { data: nextAppointment, error } = await supabase
      .from("appointments")
      .select("*, patient:patients(name, phone_number)")
      .eq("status", "waiting")
      .order("queue_number", { ascending: true })
      .limit(1)
      .single();

    if (error || !nextAppointment) {
      console.log("No next patient found in waiting queue.");
      return NextResponse.json({ message: "Queue is empty" });
    }

    // Check if they were already notified
    if (nextAppointment.notified) {
      return NextResponse.json({ message: "Next patient already notified" });
    }

    // Safely type cast the joined patient data
    // Supabase JS typing can sometimes infer arrays for 1:1 relationships depending on schema
    const patientData = Array.isArray(nextAppointment.patient) 
      ? nextAppointment.patient[0] 
      : nextAppointment.patient;

    if (!patientData || !patientData.phone_number) {
      console.log("Next patient has no phone number.");
      return NextResponse.json({ message: "No phone number" });
    }

    // Dispatch WhatsApp Reminder
    const message = `مرحباً ${patientData.name}،\nاستعد، دورك هو التالي في العيادة!`;
    
    try {
      await sendWhatsAppMessage(patientData.phone_number, message);
      
      // Mark as notified in database
      await supabase
        .from("appointments")
        .update({ notified: true })
        .eq("id", nextAppointment.id);
        
      return NextResponse.json({ success: true, message: "Reminder sent successfully" });
    } catch (evoError) {
      console.error("Evolution API failed:", evoError);
      return NextResponse.json({ success: false, error: "Failed to send WhatsApp message" }, { status: 500 });
    }

  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
