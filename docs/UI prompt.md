The "Master" UI Prompt
Role: Expert Frontend Developer & UX Designer
Framework: Next.js + Tailwind CSS + Lucide Icons + Shadcn/UI
The Prompt:
"Build a high-end, Arabic-first (RTL) Clinic Management Dashboard for a single-doctor practice in Egypt.
Design Aesthetic: > - Modern, clean, and clinical. Use a professional color palette: Primary #0284c7 (Sky-600), Background #f8fafc (Slate-50), and Emerald for success states.
•	Use the 'Cairo' font from Google Fonts for all text.
•	Ensure all layouts are strictly dir="rtl".
Layout Structure:
1.	Sidebar (Right Side): Navigation links for 'Dashboard' (الرئيسية), 'Patients' (المرضى), and 'Financials' (الحسابات). Use Lucide icons.
2.	Header: Current date in Arabic, a Search bar for patient phone numbers, and a prominent '+ Add Patient' (إضافة مريض) button.
Main Content - The Queue Dashboard:
•	Top Row: Three summary cards showing 'Total Patients Today', 'Waiting Now', and 'Daily Revenue' (EGP).
•	Main Section: A list of 'Active Queue' cards. Each card must show:
o	A sequence number badge (e.g., #1, #2).
o	Patient Name.
o	Status Badge (Waiting / With Doctor / Completed).
o	Visit Type (Consultation / Re-check).
o	Arrival Time.
o	Action Buttons: A Green WhatsApp button, a 'Call' button, and a 'Move to Next' button.
Mobile Optimization:
•	The Sidebar should collapse into a Bottom Navigation bar for mobile screens.
•	Cards should be full-width and touch-friendly (large tap targets).
Interactions:
•	Add a simple slide-over or modal for the 'Add Patient' form with fields for Name, Phone Number, and a Toggle for 'New Consultation' or 'Follow-up'."
________________________________________
💡 Nadia’s Pro-Tips for Lovable/v0:
1.	Iterative Styling: If the Arabic text looks weird, follow up with: "Please ensure font-family: 'Cairo', sans-serif; is applied globally and that all flex-direction properties handle RTL correctly."
2.	The "WhatsApp" Button: Ask it to "Make the WhatsApp button open https://wa.me/{phone} with a pre-filled Arabic greeting message."
3.	Real-Time Feel: Tell it to "Simulate the queue update with a subtle pulse animation on the 'With Doctor' status badge."
