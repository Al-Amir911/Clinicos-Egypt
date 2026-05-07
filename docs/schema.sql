-- ====================================================================
-- ClinicOS Egypt - Supabase PostgreSQL Schema
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Clinics Table
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  google_maps_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Profiles (Users) Table - links to Supabase Auth auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'secretary')),
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Patients Table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  national_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing for high-speed lookup by phone
CREATE INDEX idx_patient_phone ON patients(phone_number);

-- 4. Appointments (The Queue)
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  
  -- Queue State
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_clinic', 'completed', 'cancelled')),
  visit_type TEXT DEFAULT 'consultation' CHECK (visit_type IN ('consultation', 'follow_up')),
  queue_number SERIAL, -- Auto-incrementing number
  
  -- Finance & Records
  price NUMERIC DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  payment_method TEXT CHECK (payment_method IN ('cash', 'instapay', NULL)),
  prescription_url TEXT, -- Link to Supabase Storage bucket
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Payments Table (Optional, if detailed tracking is needed, else appointments fields suffice)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  method TEXT CHECK (method IN ('cash', 'instapay')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- RLS (Row Level Security) Policies
-- ====================================================================

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's clinic_id
CREATE OR REPLACE FUNCTION get_current_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Clinics: Users can read their own clinic
CREATE POLICY "Users can view their own clinic" 
  ON clinics FOR SELECT 
  USING (id = get_current_clinic_id());

CREATE POLICY "Allow authenticated users to create a clinic" 
  ON clinics FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Profiles: Users can read profiles in their clinic
CREATE POLICY "Users can view profiles in their clinic" 
  ON profiles FOR SELECT 
  USING (clinic_id = get_current_clinic_id());

CREATE POLICY "Allow users to create their own profile" 
  ON profiles FOR INSERT 
  TO authenticated 
  WITH CHECK (id = auth.uid());

-- Patients: Users can CRUD patients in their clinic
CREATE POLICY "Users can view patients in their clinic" ON patients FOR SELECT USING (clinic_id = get_current_clinic_id());
CREATE POLICY "Users can insert patients in their clinic" ON patients FOR INSERT WITH CHECK (clinic_id = get_current_clinic_id());
CREATE POLICY "Users can update patients in their clinic" ON patients FOR UPDATE USING (clinic_id = get_current_clinic_id());

-- Appointments: Users can CRUD appointments in their clinic
CREATE POLICY "Users can view appointments in their clinic" ON appointments FOR SELECT USING (clinic_id = get_current_clinic_id());
CREATE POLICY "Users can insert appointments in their clinic" ON appointments FOR INSERT WITH CHECK (clinic_id = get_current_clinic_id());
CREATE POLICY "Users can update appointments in their clinic" ON appointments FOR UPDATE USING (clinic_id = get_current_clinic_id());
CREATE POLICY "Users can delete appointments in their clinic" ON appointments FOR DELETE USING (clinic_id = get_current_clinic_id());

-- Payments
CREATE POLICY "Users can view payments in their clinic" ON payments FOR SELECT USING (clinic_id = get_current_clinic_id());
CREATE POLICY "Users can insert payments in their clinic" ON payments FOR INSERT WITH CHECK (clinic_id = get_current_clinic_id());

-- ====================================================================
-- REALTIME
-- ====================================================================
-- Enable Realtime for the appointments table
alter publication supabase_realtime add table appointments;

-- ====================================================================
-- STORAGE
-- ====================================================================
-- Create a new bucket (If it fails, you can create the 'clinic-records' bucket manually in the Storage UI)
insert into storage.buckets (id, name, public) values ('clinic-records', 'clinic-records', false) ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Users can only upload and read files for their clinic
CREATE POLICY "Users can upload to their clinic folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'clinic-records' AND
    (storage.foldername(name))[1] = get_current_clinic_id()::text
  );

CREATE POLICY "Users can read from their clinic folder"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'clinic-records' AND
    (storage.foldername(name))[1] = get_current_clinic_id()::text
  );
