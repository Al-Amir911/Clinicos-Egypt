export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          clinic_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          is_paid: boolean | null
          patient_id: string
          payment_method: string | null
          prescription_url: string | null
          price: number | null
          queue_number: number
          status: string | null
          visit_type: string | null
          notified: boolean
        }
        Insert: {
          clinic_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_paid?: boolean | null
          patient_id: string
          payment_method?: string | null
          prescription_url?: string | null
          price?: number | null
          queue_number?: number
          status?: string | null
          visit_type?: string | null
          notified?: boolean
        }
        Update: {
          clinic_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_paid?: boolean | null
          patient_id?: string
          payment_method?: string | null
          prescription_url?: string | null
          price?: number | null
          queue_number?: number
          status?: string | null
          visit_type?: string | null
          notified?: boolean
        }
      }
      clinics: {
        Row: {
          address: string | null
          created_at: string | null
          doctor_name: string
          google_maps_url: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          doctor_name: string
          google_maps_url?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          doctor_name?: string
          google_maps_url?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
      }
      patients: {
        Row: {
          clinic_id: string
          created_at: string | null
          id: string
          name: string
          national_id: string | null
          phone_number: string
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          id?: string
          name: string
          national_id?: string | null
          phone_number: string
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          id?: string
          name?: string
          national_id?: string | null
          phone_number?: string
        }
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string
          clinic_id: string
          created_at: string | null
          id: string
          method: string | null
        }
        Insert: {
          amount: number
          appointment_id: string
          clinic_id: string
          created_at?: string | null
          id?: string
          method?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string
          clinic_id?: string
          created_at?: string | null
          id?: string
          method?: string | null
        }
      }
      profiles: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          full_name: string
          id: string
          role: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          full_name: string
          id: string
          role: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          role?: string
        }
      }
    }
    Views: {
      [key: string]: any
    }
    Functions: {
      get_current_clinic_id: {
        Args: Record<string, unknown>
        Returns: string
      }
    }
    Enums: {
      [key: string]: any
    }
  }
}
