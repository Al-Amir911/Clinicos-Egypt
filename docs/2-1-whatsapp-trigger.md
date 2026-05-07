# Story 2.1: WhatsApp Location & Confirmation Trigger

Status: done

## Story

As a secretary,
I want a button to open WhatsApp with a pre-filled Arabic confirmation message,
so that I don't have to manually type out appointment details and clinic locations every time.

## Acceptance Criteria

1. **Given** the secretary views a patient card in the queue
2. **When** they click the WhatsApp action icon
3. **Then** the system should generate a `wa.me` link with the patient's formatted Egyptian phone number (+20)
4. **And** open a new tab with a pre-filled Arabic message containing the clinic location and booking confirmation.

## Tasks / Subtasks

- [x] Task 1: Add WhatsApp trigger button to QueueCard (AC: 1, 2)
  - [x] Import WhatsApp or MessageCircle icon from `lucide-react`
  - [x] Add interactive button to `QueueCard.tsx` using Shadcn `Button` component
- [x] Task 2: Implement phone number formatting utility (AC: 3)
  - [x] Create utility function to convert `01xxxxxxxxx` to `201xxxxxxxxx` for the wa.me API
- [x] Task 3: Generate and trigger wa.me URL (AC: 3, 4)
  - [x] Create encoded Arabic message template
  - [x] Implement `window.open(url, "_blank")` onClick handler

### Review Follow-ups (AI)
- [x] [AI-Review][Critical] Extracted phone formatting logic to `utils/format.ts` to fulfill Task 2 properly.
- [x] [AI-Review][High] Hardened phone formatter with regex to strip non-digits before formatting, preventing errors from dashes or spaces, and correctly handling existing `+20` numbers.
- [x] [AI-Review][Medium] Disabled WhatsApp button when the patient has no phone number to prevent silent failures.
- [x] [AI-Review][Low] Swapped hardcoded maps link with `process.env.NEXT_PUBLIC_CLINIC_LOCATION_URL` fallback.

## Dev Notes

- **Architecture:** We are utilizing the "WhatsApp Strategy Pattern" via frontend `wa.me` links to avoid messaging API costs for immediate, user-initiated confirmations.
- **UI Framework:** Tailwind CSS, Shadcn UI (`variant="ghost"` recommended for the card button), Lucide Icons.
- **Constraints:** Egyptian phone numbers are 11 digits starting with `0`. The API expects the country code `20` without the leading zero (e.g. `2010...`).

### Project Structure Notes

- `components/dashboard/QueueCard.tsx` is the target component.
- Helper functions can reside directly in the component or a local `utils/format.ts` file.

### References

- [Source: docs/epics.md#Epic 2]
- [Source: docs/architecture.md#Communication Architecture]

## Dev Agent Record

### Context Reference
<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used
Gemini 2.5 Pro

### Debug Log References
- Fixed TS interface bug `patientPhone` missing from `QueueCardProps`.

### Completion Notes List
- Updated `QueueList.tsx` to pass `patientPhone` to `QueueCard`.
- Updated `QueueCardProps` to require `patientPhone`.
- Added `handleWhatsApp` onClick handler to generate wa.me link with the formatted +20 prefix.
- Replaced the placeholder phone icon with a clickable `MessageCircle` icon button.
- Ran `npm run build` and tests are 100% passing.
- ✅ Resolved review finding [Critical]: Extracted phone formatting logic to `utils/format.ts`.
- ✅ Resolved review finding [High]: Robust regex implementation for handling phone variations.
- ✅ Resolved review finding [Medium]: Properly disabled UI button for patients lacking a phone record.
- ✅ Resolved review finding [Low]: Added `NEXT_PUBLIC_CLINIC_LOCATION_URL` configuration hook.

### File List
- `components/dashboard/QueueList.tsx` (modified)
- `components/dashboard/QueueCard.tsx` (modified)
- `utils/format.ts` (new)
