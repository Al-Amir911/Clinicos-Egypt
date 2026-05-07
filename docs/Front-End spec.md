1. Design System (The "Egyptian Medical" Theme)
Element	Specification	Rationale
Primary Color	#0284c7 (Sky 600)	Trustworthy, clinical, and high visibility.
Secondary Color	#10b981 (Emerald 500)	Used for "Completed" or "Paid" statuses.
Warning Color	#f59e0b (Amber 500)	Used for "Waiting" or "Follow-up" types.
Typography	Cairo, sans-serif	Best Arabic font for readability on small screens.
Spacing	8px Grid System	Ensures a "chunky" touch-friendly UI for secretaries.
________________________________________
🏗️ 2. Core Layout Architecture
The app will use a Responsive Shell with a persistent Sidebar (Desktop) or Bottom Nav (Mobile).
A. The Sidebar (RTL)
•	Top: Clinic Name + Doctor Name.
•	Links: * Dashboard (The Queue)
o	Patients (Searchable Database)
o	Finance (Daily Totals)
•	Bottom: Profile/Settings.
B. The Queue View (Main Screen)
This is a Tabbed Interface:
1.	Waiting (Active): High-priority cards.
2.	Completed: History of today's seen patients.
3.	All: Every appointment scheduled for the day.
________________________________________
📋 3. Component Specifications
3.1 The "Queue Card" (The Heart of the UI)
A highly optimized card that shows:
•	Right Side: Avatar with the patient's sequence number (e.g., #5).
•	Center: Patient Name + Visit Type Badge (Consultation vs. Re-check).
•	Left Side: Timer (Minutes since arrival) + Quick Actions Menu (WhatsApp, Call, Mark as In-Clinic).
3.2 The "Add Patient" Modal
•	Input 1: Phone Number (Standard Egyptian 11-digit validation).
•	Input 2: Patient Name.
•	Toggle: Visit Type (New / Follow-up).
•	Primary Button: "Add to Queue" (Full width, Blue).
________________________________________
⚙️ 4. Technical Frontend Requirements
•	PWA Setup: * manifest.json configured for "standalone" mode.
o	Service workers to cache the Cairo font and core dashboard assets.
•	State Management: * Use Optimistic Updates with TanStack Query. When a secretary clicks "Mark as Seen," the card should move immediately, even before the database confirms.
•	RTL Logic: * html dir="rtl" lang="ar".
o	Use logical Tailwind properties where possible (e.g., ps-4 instead of pl-4) to ensure the layout flips correctly if we ever support English.
•	Form Handling:
o	react-hook-form + zod for validation.
o	Auto-format phone numbers to include the Egyptian country code if needed for the WhatsApp bridge.
