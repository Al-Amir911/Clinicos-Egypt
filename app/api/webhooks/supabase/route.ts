import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWhatsAppMessage } from "@/utils/evolution";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    
    // Create a Supabase client with the Service Role key to bypass RLS
    // in this secure backend context.
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Security Authentication (Check for secret query param)
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    if (secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // 2. Clinic Isolation: Find the NEXT patient in the same clinic!
    const { data, error } = await supabase
      .from("appointments")
      .select("*, patient:patients(name, phone_number)")
      .eq("clinic_id", record.clinic_id)
      .eq("status", "waiting")
      .order("queue_number", { ascending: true })
      .limit(1)
      .single();
      
     
    const nextAppointment = data as any;

    if (error || !nextAppointment) {
      console.log("No next patient found in waiting queue for this clinic.");
      return NextResponse.json({ message: "Queue is empty" });
    }

    // Check if they were already notified
    if (nextAppointment.notified) {
      return NextResponse.json({ message: "Next patient already notified" });
    }

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
      const evoResult = await sendWhatsAppMessage(patientData.phone_number, message);
      
      // 3. Robustness: Only mark as notified if the message actually attempted to send
      if (evoResult !== null) {
        await supabase
          .from("appointments")
          .update({ notified: true })
          .eq("id", nextAppointment.id);
          
        return NextResponse.json({ success: true, message: "Reminder sent successfully" });
      } else {
        // Evo API is unconfigured (returns null). We do not mark as notified to avoid lying to the UI.
        return NextResponse.json({ success: false, message: "Evolution API missing keys, skipped notification." });
      }
    } catch (evoError) {
      console.error("Evolution API failed:", evoError);
      return NextResponse.json({ success: false, error: "Failed to send WhatsApp message" }, { status: 500 });
    }

  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
