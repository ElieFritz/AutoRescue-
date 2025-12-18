/**
 * AutoRescue Database Types
 * Generated from Supabase schema
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Enums
export type UserRole = 'motorist' | 'garage' | 'mechanic' | 'admin';
export type BreakdownStatus =
  | 'pending'
  | 'accepted'
  | 'mechanic_assigned'
  | 'mechanic_on_way'
  | 'mechanic_arrived'
  | 'diagnosing'
  | 'quote_sent'
  | 'quote_accepted'
  | 'repairing'
  | 'completed'
  | 'cancelled';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type PaymentType = 'diagnostic' | 'repair';
export type VehicleType = 'car' | 'motorcycle' | 'truck' | 'van' | 'bus';
export type GarageStatus = 'active' | 'inactive' | 'suspended';
export type MechanicStatus = 'available' | 'on_mission' | 'offline';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          is_verified: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          phone?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          is_verified?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          is_verified?: boolean;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          owner_id: string;
          brand: string;
          model: string;
          year: number | null;
          license_plate: string | null;
          vehicle_type: VehicleType;
          color: string | null;
          vin: string | null;
          fuel_type: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          brand: string;
          model: string;
          year?: number | null;
          license_plate?: string | null;
          vehicle_type?: VehicleType;
          color?: string | null;
          vin?: string | null;
          fuel_type?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          owner_id?: string;
          brand?: string;
          model?: string;
          year?: number | null;
          license_plate?: string | null;
          vehicle_type?: VehicleType;
          color?: string | null;
          vin?: string | null;
          fuel_type?: string | null;
          is_default?: boolean;
          updated_at?: string;
        };
      };
      garages: {
        Row: {
          id: string;
          owner_id: string | null;
          name: string;
          description: string | null;
          address: string;
          city: string;
          postal_code: string | null;
          country: string;
          location: unknown; // PostGIS geography type
          phone: string | null;
          email: string | null;
          logo_url: string | null;
          cover_image_url: string | null;
          opening_hours: Json;
          specialties: string[];
          services: string[];
          rating: number;
          total_reviews: number;
          diagnostic_fee: number;
          travel_fee_per_km: number;
          status: GarageStatus;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          name: string;
          description?: string | null;
          address: string;
          city: string;
          postal_code?: string | null;
          country?: string;
          location: unknown;
          phone?: string | null;
          email?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          opening_hours?: Json;
          specialties?: string[];
          services?: string[];
          rating?: number;
          total_reviews?: number;
          diagnostic_fee?: number;
          travel_fee_per_km?: number;
          status?: GarageStatus;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          owner_id?: string | null;
          name?: string;
          description?: string | null;
          address?: string;
          city?: string;
          postal_code?: string | null;
          country?: string;
          location?: unknown;
          phone?: string | null;
          email?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          opening_hours?: Json;
          specialties?: string[];
          services?: string[];
          rating?: number;
          total_reviews?: number;
          diagnostic_fee?: number;
          travel_fee_per_km?: number;
          status?: GarageStatus;
          is_verified?: boolean;
          updated_at?: string;
        };
      };
      mechanics: {
        Row: {
          id: string;
          user_id: string;
          garage_id: string;
          specialties: string[];
          current_location: unknown | null;
          status: MechanicStatus;
          rating: number;
          total_missions: number;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          garage_id: string;
          specialties?: string[];
          current_location?: unknown | null;
          status?: MechanicStatus;
          rating?: number;
          total_missions?: number;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          garage_id?: string;
          specialties?: string[];
          current_location?: unknown | null;
          status?: MechanicStatus;
          rating?: number;
          total_missions?: number;
          is_available?: boolean;
          updated_at?: string;
        };
      };
      breakdowns: {
        Row: {
          id: string;
          reference: string;
          motorist_id: string;
          vehicle_id: string | null;
          garage_id: string | null;
          mechanic_id: string | null;
          location: unknown;
          address: string | null;
          title: string;
          description: string | null;
          breakdown_type: string | null;
          photos: string[];
          status: BreakdownStatus;
          diagnostic_fee: number | null;
          travel_fee: number | null;
          distance_km: number | null;
          accepted_at: string | null;
          mechanic_assigned_at: string | null;
          mechanic_departed_at: string | null;
          mechanic_arrived_at: string | null;
          diagnosis_started_at: string | null;
          quote_sent_at: string | null;
          quote_accepted_at: string | null;
          repair_started_at: string | null;
          completed_at: string | null;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference?: string;
          motorist_id: string;
          vehicle_id?: string | null;
          garage_id?: string | null;
          mechanic_id?: string | null;
          location: unknown;
          address?: string | null;
          title: string;
          description?: string | null;
          breakdown_type?: string | null;
          photos?: string[];
          status?: BreakdownStatus;
          diagnostic_fee?: number | null;
          travel_fee?: number | null;
          distance_km?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          motorist_id?: string;
          vehicle_id?: string | null;
          garage_id?: string | null;
          mechanic_id?: string | null;
          location?: unknown;
          address?: string | null;
          title?: string;
          description?: string | null;
          breakdown_type?: string | null;
          photos?: string[];
          status?: BreakdownStatus;
          diagnostic_fee?: number | null;
          travel_fee?: number | null;
          distance_km?: number | null;
          accepted_at?: string | null;
          mechanic_assigned_at?: string | null;
          mechanic_departed_at?: string | null;
          mechanic_arrived_at?: string | null;
          diagnosis_started_at?: string | null;
          quote_sent_at?: string | null;
          quote_accepted_at?: string | null;
          repair_started_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          updated_at?: string;
        };
      };
      quotes: {
        Row: {
          id: string;
          breakdown_id: string;
          mechanic_id: string;
          items: Json;
          labor_cost: number;
          parts_cost: number;
          total_amount: number;
          estimated_duration_hours: number | null;
          is_accepted: boolean | null;
          accepted_at: string | null;
          rejected_at: string | null;
          rejection_reason: string | null;
          valid_until: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          breakdown_id: string;
          mechanic_id: string;
          items?: Json;
          labor_cost?: number;
          parts_cost?: number;
          total_amount: number;
          estimated_duration_hours?: number | null;
          is_accepted?: boolean | null;
          valid_until?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          breakdown_id?: string;
          mechanic_id?: string;
          items?: Json;
          labor_cost?: number;
          parts_cost?: number;
          total_amount?: number;
          estimated_duration_hours?: number | null;
          is_accepted?: boolean | null;
          accepted_at?: string | null;
          rejected_at?: string | null;
          rejection_reason?: string | null;
          valid_until?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          reference: string;
          breakdown_id: string;
          payer_id: string;
          payment_type: PaymentType;
          amount: number;
          currency: string;
          notchpay_reference: string | null;
          notchpay_transaction_id: string | null;
          status: PaymentStatus;
          metadata: Json;
          paid_at: string | null;
          failed_at: string | null;
          refunded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference?: string;
          breakdown_id: string;
          payer_id: string;
          payment_type: PaymentType;
          amount: number;
          currency?: string;
          notchpay_reference?: string | null;
          notchpay_transaction_id?: string | null;
          status?: PaymentStatus;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          breakdown_id?: string;
          payer_id?: string;
          payment_type?: PaymentType;
          amount?: number;
          currency?: string;
          notchpay_reference?: string | null;
          notchpay_transaction_id?: string | null;
          status?: PaymentStatus;
          metadata?: Json;
          paid_at?: string | null;
          failed_at?: string | null;
          refunded_at?: string | null;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          breakdown_id: string;
          mechanic_id: string;
          report_type: string;
          title: string;
          description: string | null;
          findings: string | null;
          recommendations: string | null;
          photos: string[];
          documents: string[];
          motorist_signature_url: string | null;
          signed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          breakdown_id: string;
          mechanic_id: string;
          report_type: string;
          title: string;
          description?: string | null;
          findings?: string | null;
          recommendations?: string | null;
          photos?: string[];
          documents?: string[];
          motorist_signature_url?: string | null;
          signed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          breakdown_id?: string;
          mechanic_id?: string;
          report_type?: string;
          title?: string;
          description?: string | null;
          findings?: string | null;
          recommendations?: string | null;
          photos?: string[];
          documents?: string[];
          motorist_signature_url?: string | null;
          signed_at?: string | null;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          breakdown_id: string;
          reviewer_id: string;
          garage_id: string | null;
          mechanic_id: string | null;
          rating: number;
          comment: string | null;
          response: string | null;
          responded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          breakdown_id: string;
          reviewer_id: string;
          garage_id?: string | null;
          mechanic_id?: string | null;
          rating: number;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          breakdown_id?: string;
          reviewer_id?: string;
          garage_id?: string | null;
          mechanic_id?: string | null;
          rating?: number;
          comment?: string | null;
          response?: string | null;
          responded_at?: string | null;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          reference_type: string | null;
          reference_id: string | null;
          is_read: boolean;
          read_at: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          reference_type?: string | null;
          reference_id?: string | null;
          is_read?: boolean;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          reference_type?: string | null;
          reference_id?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          metadata?: Json;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: never;
      };
    };
    Functions: {
      find_nearby_garages: {
        Args: {
          user_lat: number;
          user_lon: number;
          radius_km?: number;
          max_results?: number;
        };
        Returns: {
          garage_id: string;
          garage_name: string;
          distance_km: number;
          diagnostic_fee: number;
          travel_fee: number;
          rating: number;
        }[];
      };
      calculate_distance_km: {
        Args: {
          lat1: number;
          lon1: number;
          lat2: number;
          lon2: number;
        };
        Returns: number;
      };
    };
  };
}

// Utility types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Specific table types for easier use
export type Profile = Tables<'profiles'>;
export type Vehicle = Tables<'vehicles'>;
export type Garage = Tables<'garages'>;
export type Mechanic = Tables<'mechanics'>;
export type Breakdown = Tables<'breakdowns'>;
export type Quote = Tables<'quotes'>;
export type Payment = Tables<'payments'>;
export type Report = Tables<'reports'>;
export type Review = Tables<'reviews'>;
export type Notification = Tables<'notifications'>;
export type AuditLog = Tables<'audit_logs'>;
