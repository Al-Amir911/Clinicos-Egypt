# Story 3.1: Prescription Camera Upload

Status: in-progress

## Story

As a doctor,
I want to snap a photo of my handwritten prescription and attach it to the patient's record,
So that I don't have to spend time typing it out into the system.

## Acceptance Criteria

1. **Given** the doctor is viewing an active appointment (in the queue card)
2. **When** they click the "Upload Prescription" button
3. **Then** they can select an image or use the device camera to take a photo
4. **And** the image is securely uploaded to Supabase Storage (bucket: `prescriptions`, path: `/{clinic_id}/{patient_id}/{appointment_id}.jpg`)
5. **And** the `prescription_url` in the `appointments` table is updated with the public URL.
6. **And** a success indicator appears confirming the upload.

## Tasks / Subtasks

- [ ] Task 1: Setup Supabase Storage Bucket (AC: 4)
  - [ ] Explain how to create the `prescriptions` bucket in Supabase Dashboard.
  - [ ] Provide SQL policies to ensure authenticated users can only upload/view prescriptions for their own clinic.
- [ ] Task 2: Create Storage Utility Functions (AC: 4, 5)
  - [ ] Implement `uploadPrescription` utility in `utils/supabase/storage.ts` using `supabase-js`.
  - [ ] Update `useQueue.ts` (or create `usePrescription.ts`) with a React Query mutation to handle the file upload and subsequent database update of `prescription_url`.
- [ ] Task 3: Build UI Component for Camera/Upload (AC: 1, 2, 3, 6)
  - [ ] Add a hidden `<input type="file" accept="image/*" capture="environment">` to trigger the native camera on mobile.
  - [ ] Add an "Upload Prescription" (رفع الروشتة) button to the `QueueCard` component for appointments that are `in_clinic` or `completed`.
  - [ ] Show a loading spinner during upload and a success toast/icon upon completion.
  - [ ] Display a "View Prescription" link/button if `prescription_url` is already set.

## Dev Notes

- On mobile devices, `capture="environment"` directly opens the rear-facing camera, creating a seamless app-like experience.
- The path format `{clinic_id}/{patient_id}/{appointment_id}.jpg` naturally organizes files and makes cleanup easy.
- Supabase storage limits and allowed MIME types should ideally be configured to only allow standard images (JPEG, PNG, WebP) under ~5MB.
