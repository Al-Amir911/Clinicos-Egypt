import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const { email, password, clinicName, doctorName, fullName, adminPassword } = await req.json();

    // 1. Verify Admin Passcode
    const systemAdminPassword = process.env.REGISTRATION_ADMIN_PASSWORD;
    if (!systemAdminPassword || adminPassword !== systemAdminPassword) {
      return NextResponse.json(
        { error: "رمز مرور المسؤول غير صحيح. يرجى محاولة رمز آخر أو مراجعة مسؤول النظام." },
        { status: 401 }
      );
    }

    // 2. Initialize Supabase Server Client
    const supabase: any = await createClient();

    // 3. Sign up the user (creates Auth record)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: "فشل إنشاء الحساب" }, { status: 400 });
    }

    if (!authData.session) {
      return NextResponse.json(
        { error: "يرجى إيقاف خاصية (Confirm Email) من إعدادات Supabase Authentication والمحاولة بإيميل جديد." },
        { status: 400 }
      );
    }

    // 4. Create the Clinic
    const clinic_id = crypto.randomUUID();
    const { error: clinicError } = await supabase
      .from("clinics")
      .insert({ id: clinic_id, name: clinicName, doctor_name: doctorName });

    if (clinicError) {
      return NextResponse.json({ error: clinicError.message }, { status: 400 });
    }

    // 5. Create the User Profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        clinic_id: clinic_id,
        role: "doctor",
        full_name: fullName,
      });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: authData.user });
  } catch (err: any) {
    console.error("Registration API Error:", err);
    return NextResponse.json({ error: err.message || "حدث خطأ غير متوقع أثناء التسجيل" }, { status: 500 });
  }
}
