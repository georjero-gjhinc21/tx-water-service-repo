// types/water-service-request.ts
// Complete TypeScript types matching the updated database schema

export type RequestStatus =
  | 'new'
  | 'pending_documents'
  | 'pending_landlord_verification'
  | 'pending_credit_check'
  | 'pending_deposit'
  | 'approved'
  | 'scheduled_activation'
  | 'active'
  | 'suspended'
  | 'completed'
  | 'cancelled';

export type PropertyUseType = 
  | 'rent' 
  | 'owner_occupied' 
  | 'owner_leasing';

export type BillTypePreference = 
  | 'mail' 
  | 'email' 
  | 'both';

export type ServiceTerritory = 
  | 'inside_city_limits' 
  | 'outside_city_limits';

export interface AuthorizedPerson {
  name: string;
  phone: string;
  relationship: string;
  added_date: string;
  added_by: string;
}

export interface StaffComment {
  user: string;
  timestamp: string;
  comment: string;
}

export interface WaterServiceRequest {
  // System fields
  id: string;
  created_at: string;
  updated_at: string;
  status: RequestStatus;
  
  // Service request metadata
  service_request_date: string;
  service_start_date: string | null;
  service_stop_date: string | null;
  
  // Primary applicant information
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  applicant_alternate_phone: string | null;
  applicant_work_phone: string | null;
  
  // Identity verification
  applicant_drivers_license_number: string | null;
  applicant_drivers_license_state: string | null;
  applicant_date_of_birth: string | null;
  applicant_ssn_last4: string | null;
  // Note: applicant_ssn_encrypted is stored in DB but never sent to frontend
  
  // Signature
  applicant_signature_image_path: string | null;
  applicant_signature_timestamp: string | null;
  applicant_ip_address: string | null;
  applicant_user_agent: string | null;
  
  // Co-applicant information
  has_co_applicant: boolean;
  co_applicant_name: string | null;
  co_applicant_email: string | null;
  co_applicant_phone: string | null;
  co_applicant_alternate_phone: string | null;
  co_applicant_work_phone: string | null;
  
  // Co-applicant identity
  co_applicant_drivers_license_number: string | null;
  co_applicant_drivers_license_state: string | null;
  co_applicant_date_of_birth: string | null;
  co_applicant_ssn_last4: string | null;
  
  // Co-applicant signature
  co_applicant_signature_image_path: string | null;
  co_applicant_signature_timestamp: string | null;
  
  // Service address
  service_address: string;
  service_city: string | null;
  service_state: string | null;
  service_postal_code: string | null;
  
  // Mailing address
  mailing_address_same_as_service: boolean;
  mailing_address: string | null;
  mailing_city: string | null;
  mailing_state: string | null;
  mailing_postal_code: string | null;
  
  // Property use & ownership
  property_use_type: PropertyUseType;
  
  // Landlord information (for rentals)
  landlord_name: string | null;
  landlord_phone: string | null;
  landlord_verified: boolean;
  landlord_verification_date: string | null;
  
  // Property documents
  lease_document_path: string | null;
  lease_document_original_name: string | null;
  lease_document_uploaded_at: string | null;
  
  deed_document_path: string | null;
  deed_document_original_name: string | null;
  deed_document_uploaded_at: string | null;
  
  // Sanitation services
  trash_carts_needed: number;
  recycle_carts_needed: number;
  additional_trash_cart_fee: number | null;
  additional_recycle_cart_fee: number | null;
  
  // Property features
  has_sprinkler_system: boolean;
  has_pool: boolean;
  
  // Billing preferences
  bill_type_preference: BillTypePreference;
  
  // Account management
  account_number: string | null;
  customer_pin: string | null;
  service_territory: ServiceTerritory | null;
  authorized_persons: AuthorizedPerson[] | null;
  
  // Financial
  credit_check_performed: boolean;
  credit_check_date: string | null;
  credit_check_score: number | null;
  credit_check_result: string | null;
  
  deposit_amount_required: number | null;
  deposit_paid: boolean;
  deposit_paid_date: string | null;
  deposit_payment_method: string | null;
  deposit_transaction_id: string | null;
  
  // Work orders & activation
  meter_activation_work_order_number: string | null;
  meter_activation_scheduled_date: string | null;
  meter_activation_completed_date: string | null;
  
  trash_delivery_work_order_number: string | null;
  trash_delivery_scheduled_date: string | null;
  trash_delivery_completed_date: string | null;
  
  recycle_delivery_work_order_number: string | null;
  recycle_delivery_scheduled_date: string | null;
  recycle_delivery_completed_date: string | null;
  
  // Integration tracking
  external_system_id: string | null;
  external_system_synced: boolean;
  external_system_sync_date: string | null;
  external_system_sync_error: string | null;
  
  // Legal & compliance
  acknowledged_service_terms: boolean;
  acknowledged_service_terms_text: string | null;
  acknowledged_service_terms_timestamp: string | null;
  
  welcome_packet_sent: boolean;
  welcome_packet_sent_date: string | null;
  welcome_packet_sent_method: string | null;
  
  // Administrative notes
  staff_notes: string | null;
  internal_comments: StaffComment[] | null;
  
  // Metadata
  metadata: Record<string, any>;
}

// Form input types (what user submits)
export interface WaterServiceRequestInput {
  // Service dates
  service_start_date?: string;
  service_stop_date?: string;
  
  // Primary applicant
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  applicant_alternate_phone?: string;
  applicant_work_phone?: string;
  applicant_drivers_license_number?: string;
  applicant_drivers_license_state?: string;
  applicant_date_of_birth?: string;
  applicant_ssn?: string; // Full SSN, will be encrypted server-side
  
  // Co-applicant
  has_co_applicant: boolean;
  co_applicant_name?: string;
  co_applicant_email?: string;
  co_applicant_phone?: string;
  co_applicant_alternate_phone?: string;
  co_applicant_work_phone?: string;
  co_applicant_drivers_license_number?: string;
  co_applicant_drivers_license_state?: string;
  co_applicant_date_of_birth?: string;
  co_applicant_ssn?: string;
  
  // Addresses
  service_address: string;
  service_city?: string;
  service_state?: string;
  service_postal_code?: string;
  
  mailing_address_same_as_service: boolean;
  mailing_address?: string;
  mailing_city?: string;
  mailing_state?: string;
  mailing_postal_code?: string;
  
  // Property
  property_use_type: PropertyUseType;
  landlord_name?: string;
  landlord_phone?: string;
  
  // Sanitation
  trash_carts_needed: number;
  recycle_carts_needed: number;
  
  // Property features
  has_sprinkler_system: boolean;
  has_pool: boolean;
  
  // Billing
  bill_type_preference: BillTypePreference;
  
  // Legal
  acknowledged_service_terms: boolean;
  
  // Files (handled separately in FormData)
  lease_document?: File;
  deed_document?: File;
  applicant_signature?: File;
  co_applicant_signature?: File;
}

// Validation schemas using Zod
import { z } from 'zod';

export const WaterServiceRequestSchema = z.object({
  // Service dates
  service_start_date: z.string().optional(),
  service_stop_date: z.string().optional(),
  
  // Primary applicant
  applicant_name: z.string().min(2).max(160),
  applicant_email: z.string().email().max(160),
  applicant_phone: z.string().min(10).max(20),
  applicant_alternate_phone: z.string().min(10).max(20).optional(),
  applicant_work_phone: z.string().min(10).max(20).optional(),
  applicant_drivers_license_number: z.string().max(120).optional(),
  applicant_drivers_license_state: z.string().length(2).optional(),
  applicant_date_of_birth: z.string().optional(),
  applicant_ssn: z.string().length(11).optional(), // Format: XXX-XX-XXXX
  
  // Co-applicant
  has_co_applicant: z.boolean(),
  co_applicant_name: z.string().min(2).max(160).optional(),
  co_applicant_email: z.string().email().max(160).optional(),
  co_applicant_phone: z.string().min(10).max(20).optional(),
  co_applicant_alternate_phone: z.string().min(10).max(20).optional(),
  co_applicant_work_phone: z.string().min(10).max(20).optional(),
  co_applicant_drivers_license_number: z.string().max(120).optional(),
  co_applicant_drivers_license_state: z.string().length(2).optional(),
  co_applicant_date_of_birth: z.string().optional(),
  co_applicant_ssn: z.string().length(11).optional(),
  
  // Addresses
  service_address: z.string().min(4).max(240),
  service_city: z.string().max(120).optional(),
  service_state: z.string().length(2).optional(),
  service_postal_code: z.string().max(20).optional(),
  
  mailing_address_same_as_service: z.boolean(),
  mailing_address: z.string().min(4).max(240).optional(),
  mailing_city: z.string().max(120).optional(),
  mailing_state: z.string().length(2).optional(),
  mailing_postal_code: z.string().max(20).optional(),
  
  // Property
  property_use_type: z.enum(['rent', 'owner_occupied', 'owner_leasing']),
  landlord_name: z.string().max(160).optional(),
  landlord_phone: z.string().min(10).max(20).optional(),
  
  // Sanitation
  trash_carts_needed: z.number().int().min(0).max(10),
  recycle_carts_needed: z.number().int().min(0).max(10),
  
  // Property features
  has_sprinkler_system: z.boolean(),
  has_pool: z.boolean(),
  
  // Billing
  bill_type_preference: z.enum(['mail', 'email', 'both']),
  
  // Legal
  acknowledged_service_terms: z.boolean().refine(val => val === true, {
    message: "You must acknowledge the service terms"
  }),
}).superRefine((data, ctx) => {
  // Validate co-applicant data if has_co_applicant is true
  if (data.has_co_applicant) {
    if (!data.co_applicant_name || data.co_applicant_name.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['co_applicant_name'],
        message: "Co-applicant name is required when adding a co-applicant",
      });
    }
    if (!data.co_applicant_phone || data.co_applicant_phone.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['co_applicant_phone'],
        message: "Co-applicant phone is required when adding a co-applicant",
      });
    }
  }
  
  // Validate mailing address if different from service address
  if (!data.mailing_address_same_as_service) {
    if (!data.mailing_address || data.mailing_address.length < 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mailing_address'],
        message: "Mailing address is required when different from service address",
      });
    }
  }
  
  // Validate landlord info for rentals
  if (data.property_use_type === 'rent') {
    if (!data.landlord_name || data.landlord_name.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['landlord_name'],
        message: "Landlord name is required for rental properties",
      });
    }
    if (!data.landlord_phone || data.landlord_phone.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['landlord_phone'],
        message: "Landlord phone is required for rental properties",
      });
    }
  }
});

// Helper types for form steps
export interface Step1Data {
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  applicant_alternate_phone?: string;
  applicant_work_phone?: string;
  bill_type_preference: BillTypePreference;
}

export interface Step2Data {
  service_address: string;
  service_city?: string;
  service_state?: string;
  service_postal_code?: string;
  mailing_address_same_as_service: boolean;
  mailing_address?: string;
  mailing_city?: string;
  mailing_state?: string;
  mailing_postal_code?: string;
  service_start_date?: string;
  service_stop_date?: string;
}

export interface Step3Data {
  property_use_type: PropertyUseType;
  landlord_name?: string;
  landlord_phone?: string;
  trash_carts_needed: number;
  recycle_carts_needed: number;
  has_sprinkler_system: boolean;
  has_pool: boolean;
}

export interface Step4Data {
  applicant_drivers_license_number?: string;
  applicant_drivers_license_state?: string;
  applicant_date_of_birth?: string;
  applicant_ssn?: string;
  has_co_applicant: boolean;
  co_applicant_name?: string;
  co_applicant_email?: string;
  co_applicant_phone?: string;
  co_applicant_drivers_license_number?: string;
  co_applicant_drivers_license_state?: string;
  co_applicant_date_of_birth?: string;
  co_applicant_ssn?: string;
  lease_document?: File;
  deed_document?: File;
}

export interface Step5Data {
  acknowledged_service_terms: boolean;
  applicant_signature?: File;
  co_applicant_signature?: File;
}

// Admin view types
export interface WaterServiceRequestSummary {
  id: string;
  created_at: string;
  status: RequestStatus;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  service_address: string;
  property_use_type: PropertyUseType;
  account_number: string | null;
  meter_activation_scheduled_date: string | null;
}

// Dashboard statistics
export interface DashboardStats {
  total_requests: number;
  new_requests: number;
  pending_verification: number;
  pending_deposits: number;
  scheduled_activations: number;
  active_accounts: number;
  completed_this_month: number;
  cancelled: number;
}

// Rate calculation helper
export interface RateCalculation {
  // Calculated rates
  waterRate: number;
  trashRate: number;
  recycleRate: number;
  poolSurcharge: number;
  subtotal: number;
  estimatedTotal: number;
  notes: string[];

  // Base rates
  base_water_rate: number;
  trash_base_rate: number;
  recycle_base_rate: number;
  territory_multiplier: number;
  additional_trash_cart_fee: number;
  additional_recycle_cart_fee: number;
  pool_surcharge: number;
  irrigation_tier_rate: number;
  estimated_monthly_total: number;
  deposit_required: number;
}
