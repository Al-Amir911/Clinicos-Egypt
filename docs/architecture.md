The "Lean Clinic" Architecture (2026 Edition)
1. High-Level Flow
The system acts as a real-time coordinator between the Secretary's desk and the Doctor's exam room.
1.	Client Tier: Next.js 15 PWA. This is where the WhatsApp URL Generator lives.
2.	Logic Tier: Supabase Edge Functions (for heavy lifting like Daily Reports) and local utils for link generation.
3.	Data Tier: Supabase (PostgreSQL + Realtime + Storage).
________________________________________
📂 2. Refined Data Schema (Supabase/Postgres)
I’ve streamlined the schema to ensure that every appointment has the necessary metadata for the WhatsApp links to work perfectly.
SQL
CREATE TABLE clinics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location_url TEXT -- Configurable in Settings Page
);

-- ENABLE REALTIME FOR THIS TABLE
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Queue & Scheduling State
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_clinic', 'completed', 'cancelled')),
  visit_type TEXT DEFAULT 'consultation' CHECK (visit_type IN ('consultation', 'follow_up')),
  queue_number SERIAL, -- Auto-incrementing number for the day
  scheduled_time TIMESTAMP WITH TIME ZONE, -- Used for reservations and Calendar view
  
  -- Finance & Records
  price NUMERIC DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  prescription_url TEXT, -- Link to Supabase Storage bucket
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexing for high-speed lookup by phone and name (for search-as-you-type)
CREATE INDEX idx_patient_phone ON patients(phone_number);
-- Enable pg_trgm extension if not exists for partial text matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_patient_name_trgm ON patients USING gin (name gin_trgm_ops);
________________________________________
📲 3. The WhatsApp Utility Architecture
Instead of a backend service, we use a Strategy Pattern on the frontend to manage messages.
•	Location/Confirmation Strategy: Pulls `location_url` from `clinics` table and `scheduled_time` from `appointments` to return Google Maps link, clinic address, appointment date, and time.
•	Follow-up Strategy: Returns "How are you feeling?" + clinic phone.
Architectural Advantage: Zero server costs and zero risk of the "Bot" getting banned by Meta.
________________________________________
🖼️ 4. Storage Architecture (The Prescription Snap)
Since we want "Izi" uploads:
•	Bucket: clinic-records
•	Pathing: /{clinic_id}/{patient_id}/{appointment_id}.jpg
•	Security: RLS (Row Level Security) ensures only the logged-in doctor/secretary of that specific clinic can generate a signed URL to view the image.
________________________________________
🛡️ 5. Non-Functional Architecture (Reliability)
Constraint	Architectural Solution
Internet Outage	PWA + Service Worker: Caches the main dashboard shell and Arabic fonts (Cairo).
Concurreny	Postgres Realtime: When the secretary adds a patient, the doctor’s dashboard pulses and updates without a refresh.
Data Sovereignty	Supabase Region: Deployment to me-central-1 (if available) or eu-central-1 to keep data latency low for Egypt.
Search Speed	Frontend Debouncing: Global search input is debounced to limit API calls, combined with GIN trgm index on Postgres to maintain < 300ms speed.
________________________________________
🚀 Implementation Blueprint for your IDE
Phase 1 (The Bones):
"Set up Supabase with the provided SQL schema. Initialize a Next.js project with Tailwind and lucide-react. Create a whatsapp.ts utility file that handles URL generation for +20 Egyptian numbers."
Phase 2 (The Real-time Queue):
"Build a Dashboard component that uses supabase-js to subscribe to the appointments table. Use a 'Waiting' column and a 'Completed' column. Ensure the layout is dir='rtl'."
Phase 3 (The 'One-Click' Upload):
"Add a button to the Patient card that triggers the device camera. On photo capture, upload the file to Supabase Storage and save the URL to the appointment record."
________________________________________
PM/Architect Check: We have the PRD, the UX spec, and the Tech Architecture. Everything is aligned for a Single-Doctor focus using wa.me for speed.
