Product Requirements Document (PRD): ClinicOS v1.0
Project Name: ClinicOS Egypt
Target: Single-Doctor Private Clinics (Specialties: GP, Derm, Peds)
Primary Goal: Replace paper-based workflows with a high-speed, localized digital queue.
________________________________________
1. Executive Summary
ClinicOS is a "Vibe-Coded" SaaS aimed at the 100k+ private clinics in Egypt. It prioritizes local payment habits (InstaPay), local communication (WhatsApp), and local UI (Arabic-First).
________________________________________
2. Functional Requirements (FRs)
ID	Feature	Description	Priority
FR1	RTL Arabic UI	Native Egyptian Arabic interface using the Cairo font.	P0
FR2	Patient Registry	Create/Search patients via Name, Phone, or National ID.	P0
FR3	Live Queue Mgmt	A real-time status dashboard (Waiting -> In-Clinic -> Completed).	P0
FR4	WA Link Trigger	Button to open WhatsApp with a pre-filled Arabic message template.	P0
FR5	Media Upload	Upload/Camera capture of handwritten prescriptions/lab results.	P1
FR6	Payment Ledger	Log "Amount Paid" and "Method" (Cash vs. InstaPay).	P1
FR7	Daily Revenue	End-of-day summary card for the Doctor.	P1
FR8	WA Automation	Headless browser bridge for automated background messages.	P2
FR9	Global Search	Search-as-you-type for patients (Name/Phone) with a direct "Book" button.	P1
FR10	Calendar View	Time-Grid Calendar UI showing 30-minute slots based on configurable working hours; click empty slots to instantly book.	P1
FR11	Settings Page	Dedicated page to configure clinic details (location/maps link) and working hours (start/end time).	P1
FR12	Directories	Dedicated pages for "Patients Directory" and "Financial Ledger".	P2
FR13	Dynamic WA Msgs	WhatsApp messages must explicitly include appointment date, time, and location.	P1
________________________________________
3. Non-Functional Requirements (NFRs)
•	NFR1: Performance: Page loads, queue updates, and search-as-you-type must occur in < 300ms.
•	NFR2: Offline-First: Must be a PWA (Progressive Web App) to allow basic data entry during Egypt's frequent internet outages.
•	NFR3: Security: Data encryption at rest (Supabase) to comply with basic data privacy expectations.
•	NFR4: Usability: The "Secretary Test"—A new user must be able to book a patient in under 15 seconds without training.
________________________________________
4. Epics & User Stories
Epic 1: The Core Queue (The "MVP")
•	Story 1: As a Secretary, I want to add a patient quickly so I don't keep them standing at the desk.
•	Story 2: As a Secretary, I want to see a list of today's patients sorted by arrival time so I know who is next.
•	Story 3: As a Doctor, I want to see the status of the waiting room from my phone/tablet in the exam room.
Epic 2: Communication & Automation
•	Story 4: As a Secretary, I want a button that opens WhatsApp with the clinic's location so I don't have to type it manually.
•	Story 5: As a Patient, I want to receive a confirmation message so I know my spot is reserved.
Epic 3: Records & Finance
•	Story 6: As a Doctor, I want to snap a photo of my handwritten prescription so I have a digital history without typing.
•	Story 7: As a Doctor, I want to see how much cash was collected at the end of the day to prevent "leakage."
•	Story 8: As a Doctor, I want dedicated pages for a full Patients Directory and a Financial Ledger to review historical data.

Epic 4: Advanced Directory, Scheduling & Settings
•	Story 9: As a Secretary, I want a search-as-you-type bar to instantly find patients and book an appointment with one click.
•	Story 10: As a Secretary, I want a Time-Grid Calendar view with 30-minute slots to see exactly which times are empty and which are booked.
•	Story 11: As a Clinic Manager, I want a Settings page to input the clinic location and configure working hours (e.g., 9:00 AM to 6:00 PM) for the calendar slots.
•	Story 12: As a Patient, I want my WhatsApp confirmation to explicitly include my appointment date, time, and the correct clinic location.
________________________________________
5. Technical Stack (The "Izi" Stack)
•	Frontend: Next.js 14, Tailwind CSS, Lucide Icons.
•	Backend: Supabase (Postgres + Auth + Storage).
•	Localization: i18next with dir="rtl".
•	Deployment: Vercel (Production) + Local scripts for the WhatsApp bridge.
________________________________________
6. User Flow Diagram
________________________________________
7. Success Criteria
1.	Zero Training: The clinic starts using it within 10 minutes of account creation.
2.	No Paper: The clinic stops using the "Daily Notebook" for revenue tracking.
3.	Referral: The first 10 doctors recommend it to at least one colleague.
PM's Final Note: "Keep the code modular. We are starting with single-doctor clinics, but the database should be able to support multiple rooms later. Focus on the Queue Dashboard first—it’s the 'heart' of the app."
