---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories", "step-04-final-validation"]
inputDocuments: ["docs/PRD.md", "docs/architecture.md", "docs/Front-End spec.md", "docs/UI prompt.md", "docs/Project Brief.md"]
---

# Clinic System - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Clinic System, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: RTL Arabic UI Native Egyptian Arabic interface using the Cairo font.
FR2: Patient Registry Create/Search patients via Name, Phone, or National ID.
FR3: Live Queue Mgmt A real-time status dashboard (Waiting -> In-Clinic -> Completed).
FR4: WA Link Trigger Button to open WhatsApp with a pre-filled Arabic message template.
FR5: Media Upload Upload/Camera capture of handwritten prescriptions/lab results.
FR6: Payment Ledger Log "Amount Paid" and "Method" (Cash vs. InstaPay).
FR7: Daily Revenue End-of-day summary card for the Doctor.
FR8: WA Automation Headless browser bridge for automated background messages.

### NonFunctional Requirements

NFR1: Performance: Page loads and queue updates must occur in < 300ms to compete with the speed of paper.
NFR2: Offline-First: Must be a PWA (Progressive Web App) to allow basic data entry during Egypt's frequent internet outages.
NFR3: Security: Data encryption at rest (Supabase) to comply with basic data privacy expectations.
NFR4: Usability: The "Secretary Test"—A new user must be able to book a patient in under 15 seconds without training.

### Additional Requirements

- **Starter Template:** Next.js 15 PWA with App Router.
- **State Management:** TanStack Query for optimistic updates and real-time UI.
- **Database:** Supabase (PostgreSQL + Realtime + Storage).
- **Communication Architecture:** WhatsApp Strategy Pattern via frontend `wa.me` links (zero server costs).
- **UI Framework:** Tailwind CSS, Shadcn UI, Lucide Icons, `dir="rtl" lang="ar"`.
- **Form Handling:** `react-hook-form` + `zod` with auto-formatting for Egyptian phone numbers.
- **Theme:** Primary Sky 600, Secondary Emerald 500, Warning Amber 500 with Cairo font and 8px grid spacing.
- **Storage:** Supabase Storage with bucket path `/{clinic_id}/{patient_id}/{appointment_id}.jpg` and RLS security.
- **Deployment:** Vercel with server region me-central-1 or eu-central-1.

### FR Coverage Map

FR1: Epic 1 - RTL Arabic UI
FR2: Epic 1 - Patient Registry
FR3: Epic 1 - Live Queue Mgmt
FR4: Epic 2 - WA Link Trigger
FR5: Epic 3 - Media Upload
FR6: Epic 3 - Payment Ledger
FR7: Epic 3 - Daily Revenue
FR8: Epic 2 - WA Automation
FR9: Epic 4 - Global Search
FR10: Epic 4 - Calendar View
FR11: Epic 4 - Settings Page
FR12: Epic 4 - Directories
FR13: Epic 4 - Dynamic WA Msgs

## Epic List

### Epic 1: The Core Queue MVP
The secretary can instantly register patients and manage a real-time waiting room, giving the doctor live visibility into their clinic's status.
**FRs covered:** FR1, FR2, FR3

### Epic 2: Patient Communication & Automation
The clinic can eliminate the "WhatsApp Chaos" by sending one-click confirmations and automated background reminders to reduce patient no-shows.
**FRs covered:** FR4, FR8

### Epic 3: Digital Records & Financial Tracking
The doctor can instantly digitize handwritten prescriptions via camera upload and completely replace their daily paper ledger with automated revenue tracking.
**FRs covered:** FR5, FR6, FR7

### Epic 4: Advanced Directory, Scheduling & Settings
The clinic gains a global search-as-you-type bar, a full Calendar view, dedicated Directory/Ledger pages, and a Settings page to manage location data for dynamic WhatsApp messaging.
**FRs covered:** FR9, FR10, FR11, FR12, FR13

## Epic 1: The Core Queue MVP

The secretary can instantly register patients and manage a real-time waiting room, giving the doctor live visibility into their clinic's status.

### Story 1.1: RTL App Shell and Navigation

As a user,
I want a responsive, Arabic-first interface with Cairo font and Right-to-Left layout,
So that the application feels native and comfortable to use.

**Acceptance Criteria:**

**Given** a user opens the application
**When** the layout renders
**Then** the text direction must be RTL and use Cairo font
**And** the primary navigation (sidebar/bottom nav) must be accessible on both desktop and mobile.

### Story 1.2: Patient Registration

As a secretary,
I want to quickly add a patient's name, phone, and visit type,
So that I can get them into the waiting queue in under 15 seconds without training.

**Acceptance Criteria:**

**Given** the secretary is on the dashboard
**When** they click "Add Patient" and fill out the validated form (Zod/React Hook Form)
**Then** the patient is saved to the Supabase database
**And** immediately appears in the live queue via optimistic updates.

### Story 1.3: Live Queue Dashboard

As a doctor or secretary,
I want to see a real-time list of patients categorized by "Waiting" and "Completed",
So that I know who is next without asking or refreshing the page.

**Acceptance Criteria:**

**Given** the dashboard is open
**When** a new patient is added or a status is changed to "Completed"
**Then** the UI must update instantly
**And** the changes must sync in real-time across all connected devices via Supabase.

## Epic 2: Patient Communication & Automation

The clinic can eliminate the "WhatsApp Chaos" by sending one-click confirmations and automated background reminders to reduce patient no-shows.

### Story 2.1: WhatsApp Location & Confirmation Trigger

As a secretary,
I want a button to open WhatsApp with a pre-filled Arabic confirmation message,
So that I don't have to manually type out appointment details and clinic locations every time.

**Acceptance Criteria:**

**Given** the secretary views a patient card in the queue
**When** they click the WhatsApp action icon
**Then** the system should generate a `wa.me` link with the patient's formatted Egyptian phone number (+20)
**And** open a new tab with a pre-filled Arabic message containing the clinic location and booking confirmation.

### Story 2.2: Automated Background Reminders

As a clinic owner,
I want a background system to send automated WhatsApp reminders (e.g., "Your turn is next"),
So that no-shows are reduced without the secretary having to do manual tracking.

**Acceptance Criteria:**

**Given** a patient is next in the queue (e.g., the person before them is marked "In-Clinic")
**When** the system detects this state change via Supabase
**Then** the headless WhatsApp bridge (Evolution API) should dispatch an automated Arabic reminder to the patient's phone number
**And** the UI should ideally show a small "Notified" indicator on the patient's card.

## Epic 3: Digital Records & Financial Tracking

The doctor can instantly digitize handwritten prescriptions via camera upload and completely replace their daily paper ledger with automated revenue tracking.

### Story 3.1: Prescription Camera Upload

As a doctor,
I want to snap a photo of my handwritten prescription and attach it to the patient's record,
So that I don't have to spend time typing it out into the system.

**Acceptance Criteria:**

**Given** the doctor is viewing an active appointment
**When** they click the "Upload Prescription" button
**Then** they can select an image or use the device camera to take a photo
**And** the image is securely uploaded to Supabase Storage (path: `/{clinic_id}/{patient_id}/{appointment_id}.jpg`)
**And** a success indicator appears confirming the upload.

### Story 3.2: Payment Logging

As a secretary,
I want to log the amount paid and the payment method (Cash vs. InstaPay) for each appointment,
So that I don't have to write it down in a separate paper notebook.

**Acceptance Criteria:**

**Given** an appointment is being marked as "Completed"
**When** the secretary clicks to complete the visit
**Then** a prompt appears asking for the Amount Paid and Method (Cash/InstaPay)
**And** this data is saved to the `payments` table associated with the appointment.

### Story 3.3: Daily Revenue Summary

As a doctor,
I want an end-of-day summary card showing total revenue split by Cash and InstaPay,
So that I can reconcile the day's earnings instantly and prevent leakage.

**Acceptance Criteria:**

**Given** the doctor is viewing the dashboard
**When** they look at the summary cards section
**Then** they should see cards displaying "Total Today", "Cash", and "InstaPay"
**And** these values should automatically calculate from today's logged payments in real-time.

## Epic 4: Advanced Directory, Scheduling & Settings

The clinic gains a global search-as-you-type bar, a full Calendar view, dedicated Directory/Ledger pages, and a Settings page to manage location data for dynamic WhatsApp messaging.

### Story 4.1: Search-as-you-type & Instant Booking

As a secretary,
I want a search bar at the top of the application that searches as soon as I type a name or number,
So that I can quickly find a patient and make a new reservation for them without waiting.

**Acceptance Criteria:**

**Given** the secretary is logged into the application
**When** they type in the global search bar
**Then** the system should display matching patients instantly (debounced)
**And** each result must have a "Book Reservation" button
**And** clicking this button opens the Add Patient modal pre-filled with the patient's details.

### Story 4.2: Calendar View & Scheduled Appointments

As a secretary,
I want to see all reservations in a calendar view and assign dates and times to new bookings,
So that I can manage future appointments, not just today's live queue.

**Acceptance Criteria:**

**Given** the secretary navigates to the Calendar page
**When** they view the page
**Then** they see a calendar interface showing all scheduled appointments
**And** when adding a new patient/reservation, they can specify an Appointment Date and Time (saved as `scheduled_time`).

### Story 4.3: Clinic Settings & Location Management

As a clinic manager,
I want a Settings page to input and save the clinic's location (e.g., Google Maps link),
So that our automated messages always send the correct location to patients.

**Acceptance Criteria:**

**Given** a user navigates to the Settings page
**When** they enter a Google Maps URL and click Save
**Then** the `location_url` is saved to the `clinics` table in Supabase
**And** this value is used dynamically by the WhatsApp message generator.

### Story 4.4: Dynamic WhatsApp Messages

As a patient,
I want my WhatsApp confirmation message to include my appointment date, time, and the correct clinic location,
So that I don't get lost and know exactly when to arrive.

**Acceptance Criteria:**

**Given** a secretary clicks the WhatsApp confirmation button for an appointment
**When** the `wa.me` link is generated
**Then** the pre-filled Arabic message must explicitly include the appointment's `scheduled_time` (Date and Time)
**And** the message must append the clinic's `location_url` from the Settings.

### Story 4.5: Dedicated Patients Directory & Financial Ledger

As a doctor or clinic manager,
I want full, dedicated pages for the "Patients Directory" and "Financial Ledger",
So that I can review all historical patient records and financial data outside of the daily dashboard view.

**Acceptance Criteria:**

**Given** the user navigates using the sidebar
**When** they click on "Patients Directory" or "Financial Ledger"
**Then** they are taken to a dedicated page with a comprehensive data table
**And** the tables support pagination and filtering.
