# Story 2.2: Automated Background Reminders

Status: ready-for-dev

## Story

As a clinic owner,
I want a background system to send automated WhatsApp reminders (e.g., "Your turn is next"),
So that no-shows are reduced without the secretary having to do manual tracking.

## Acceptance Criteria

1. **Given** a patient is next in the queue (e.g., the person before them is marked "In-Clinic")
2. **When** the system detects this state change via Supabase
3. **Then** the headless WhatsApp bridge (Evolution API) should dispatch an automated Arabic reminder to the patient's phone number
4. **And** the UI should ideally show a small "Notified" indicator on the patient's card.

## Tasks / Subtasks

- [ ] Task 1: Setup Database Webhook for appointment state changes (AC: 1, 2)
  - [ ] Create a PostgreSQL trigger or configure a Supabase Webhook to monitor `status` updates on the `appointments` table.
  - [ ] Create a Next.js API route (`app/api/webhooks/supabase/route.ts`) to receive and process the webhook payloads.
- [ ] Task 2: Implement Evolution API integration logic (AC: 3)
  - [ ] Implement a query to find the "next in line" patient when the webhook fires.
  - [ ] Create an Evolution API helper in `utils/evolution.ts` using `EVO_API_URL` and `EVO_API_KEY`.
  - [ ] Dispatch an automated Arabic reminder (e.g., "استعد، دورك هو التالي!") to the patient's formatted phone number.
- [ ] Task 3: Update QueueCard UI with a "Notified" indicator (AC: 4)
  - [ ] Add a `notified` boolean column to the `appointments` table to track reminder status.
  - [ ] Update `QueueCard.tsx` to conditionally render a small "تم التنبيه" (Notified) checkmark badge if `notified` is true.

## Dev Notes

- **Architecture:** We are using Next.js API Routes as a secure bridge for the Webhook. The API Route will handle the secret Evolution API Keys to prevent exposing them to the client.
- **Integration:** Evolution API requires a specific payload structure. Refer to the `.env` variables required: `EVO_API_URL` and `EVO_API_KEY`.
- **Database Rules:** Remember to update Supabase types/interfaces if a `notified` column is added to the database.

### Project Structure Notes

- `app/api/webhooks/supabase/route.ts` is the new endpoint.
- `utils/evolution.ts` will manage the HTTP POST requests to the Evolution server.

### References

- [Source: docs/epics.md#Epic 2]
- [Source: docs/architecture.md#Communication Architecture]

## Dev Agent Record

### Context Reference
<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used
Gemini 2.5 Pro

### Debug Log References

### Completion Notes List

### File List
