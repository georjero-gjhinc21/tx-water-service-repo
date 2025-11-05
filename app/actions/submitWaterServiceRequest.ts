"use server";

import { createServerClient } from '@/lib/supabase/server';
import type { PropertyUseType, ServiceTerritory } from '@/types/water-service-request';
import { calculateMonthlyRate, calculateDeposit } from '@/app/lib/calculations';

export async function submitWaterServiceRequest(formData: FormData) {
  try {
    const supabase = createServerClient();

    // Extract form data
    const data = {
      // Step 1: Contact Information
      applicant_name: formData.get('applicant_name') as string,
      applicant_email: formData.get('applicant_email') as string,
      applicant_phone: formData.get('applicant_phone') as string,
      applicant_alternate_phone: formData.get('applicant_alternate_phone') as string || null,
      applicant_work_phone: formData.get('applicant_work_phone') as string || null,
      bill_type_preference: formData.get('bill_type_preference') as string,

      // Step 2: Address & Service Dates
      service_address: formData.get('service_address') as string,
      service_city: formData.get('service_city') as string || null,
      service_state: formData.get('service_state') as string || null,
      service_postal_code: formData.get('service_postal_code') as string || null,
      mailing_address_same_as_service: formData.get('mailing_address_same_as_service') === 'true',
      mailing_address: formData.get('mailing_address') as string || null,
      mailing_city: formData.get('mailing_city') as string || null,
      mailing_state: formData.get('mailing_state') as string || null,
      mailing_postal_code: formData.get('mailing_postal_code') as string || null,
      service_start_date: formData.get('service_start_date') as string || null,
      service_stop_date: formData.get('service_stop_date') as string || null,

      // Step 3: Property & Services
      property_use_type: formData.get('property_use_type') as PropertyUseType,
      landlord_name: formData.get('landlord_name') as string || null,
      landlord_phone: formData.get('landlord_phone') as string || null,
      trash_carts_needed: parseInt(formData.get('trash_carts_needed') as string) || 1,
      recycle_carts_needed: parseInt(formData.get('recycle_carts_needed') as string) || 1,
      has_sprinkler_system: formData.get('has_sprinkler_system') === 'true',
      has_pool: formData.get('has_pool') === 'true',
      service_territory: formData.get('service_territory') as ServiceTerritory || null,

      // Step 4: Identity & Co-Applicant
      applicant_drivers_license_number: formData.get('applicant_drivers_license_number') as string || null,
      applicant_drivers_license_state: formData.get('applicant_drivers_license_state') as string || null,
      applicant_date_of_birth: formData.get('applicant_date_of_birth') as string || null,
      applicant_ssn: formData.get('applicant_ssn') as string || null,
      has_co_applicant: formData.get('has_co_applicant') === 'true',
      co_applicant_name: formData.get('co_applicant_name') as string || null,
      co_applicant_email: formData.get('co_applicant_email') as string || null,
      co_applicant_phone: formData.get('co_applicant_phone') as string || null,
      co_applicant_alternate_phone: formData.get('co_applicant_alternate_phone') as string || null,
      co_applicant_work_phone: formData.get('co_applicant_work_phone') as string || null,
      co_applicant_drivers_license_number: formData.get('co_applicant_drivers_license_number') as string || null,
      co_applicant_drivers_license_state: formData.get('co_applicant_drivers_license_state') as string || null,
      co_applicant_date_of_birth: formData.get('co_applicant_date_of_birth') as string || null,
      co_applicant_ssn: formData.get('co_applicant_ssn') as string || null,

      // Step 5: Review & Signature
      acknowledged_service_terms: formData.get('acknowledged_service_terms') === 'true',
      applicant_signature: formData.get('applicant_signature') as string,
      co_applicant_signature: formData.get('co_applicant_signature') as string || null,
    };

    // Get files
    const leaseDocument = formData.get('lease_document') as File | null;
    const deedDocument = formData.get('deed_document') as File | null;

    // Calculate deposit and rates
    const monthlyRate = calculateMonthlyRate(
      data.service_territory,
      data.trash_carts_needed,
      data.recycle_carts_needed,
      data.has_pool,
      data.has_sprinkler_system
    );

    const depositAmount = calculateDeposit(
      data.property_use_type,
      data.service_territory,
      null // credit score not yet performed
    );

    // Handle file uploads
    let leaseDocumentPath = null;
    let deedDocumentPath = null;

    if (leaseDocument && leaseDocument.size > 0) {
      const leaseFileName = `${Date.now()}-${leaseDocument.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`leases/${leaseFileName}`, leaseDocument);

      if (uploadError) {
        console.error('Lease upload error:', uploadError);
      } else {
        leaseDocumentPath = uploadData.path;
      }
    }

    if (deedDocument && deedDocument.size > 0) {
      const deedFileName = `${Date.now()}-${deedDocument.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`deeds/${deedFileName}`, deedDocument);

      if (uploadError) {
        console.error('Deed upload error:', uploadError);
      } else {
        deedDocumentPath = uploadData.path;
      }
    }

    // Extract last 4 of SSN for storage (full SSN should be encrypted separately)
    const applicant_ssn_last4 = data.applicant_ssn
      ? data.applicant_ssn.replace(/\D/g, '').slice(-4)
      : null;

    const co_applicant_ssn_last4 = data.co_applicant_ssn
      ? data.co_applicant_ssn.replace(/\D/g, '').slice(-4)
      : null;

    // Prepare database record
    const record = {
      // Contact info
      applicant_name: data.applicant_name,
      applicant_email: data.applicant_email,
      applicant_phone: data.applicant_phone,
      applicant_alternate_phone: data.applicant_alternate_phone,
      applicant_work_phone: data.applicant_work_phone,
      bill_type_preference: data.bill_type_preference,

      // Address
      service_address: data.service_address,
      service_city: data.service_city,
      service_state: data.service_state,
      service_postal_code: data.service_postal_code,
      mailing_address_same_as_service: data.mailing_address_same_as_service,
      mailing_address: data.mailing_address,
      mailing_city: data.mailing_city,
      mailing_state: data.mailing_state,
      mailing_postal_code: data.mailing_postal_code,

      // Service dates
      service_request_date: new Date().toISOString(),
      service_start_date: data.service_start_date,
      service_stop_date: data.service_stop_date,

      // Property
      property_use_type: data.property_use_type,
      landlord_name: data.landlord_name,
      landlord_phone: data.landlord_phone,
      service_territory: data.service_territory,

      // Services
      trash_carts_needed: data.trash_carts_needed,
      recycle_carts_needed: data.recycle_carts_needed,
      has_sprinkler_system: data.has_sprinkler_system,
      has_pool: data.has_pool,

      // Identity
      applicant_drivers_license_number: data.applicant_drivers_license_number,
      applicant_drivers_license_state: data.applicant_drivers_license_state,
      applicant_date_of_birth: data.applicant_date_of_birth,
      applicant_ssn_last4: applicant_ssn_last4,

      // Co-applicant
      has_co_applicant: data.has_co_applicant,
      co_applicant_name: data.co_applicant_name,
      co_applicant_email: data.co_applicant_email,
      co_applicant_phone: data.co_applicant_phone,
      co_applicant_alternate_phone: data.co_applicant_alternate_phone,
      co_applicant_work_phone: data.co_applicant_work_phone,
      co_applicant_drivers_license_number: data.co_applicant_drivers_license_number,
      co_applicant_drivers_license_state: data.co_applicant_drivers_license_state,
      co_applicant_date_of_birth: data.co_applicant_date_of_birth,
      co_applicant_ssn_last4: co_applicant_ssn_last4,

      // Documents
      lease_document_path: leaseDocumentPath,
      lease_document_original_name: leaseDocument?.name || null,
      lease_document_uploaded_at: leaseDocumentPath ? new Date().toISOString() : null,
      deed_document_path: deedDocumentPath,
      deed_document_original_name: deedDocument?.name || null,
      deed_document_uploaded_at: deedDocumentPath ? new Date().toISOString() : null,

      // Legal
      acknowledged_service_terms: data.acknowledged_service_terms,
      acknowledged_service_terms_timestamp: new Date().toISOString(),

      // Calculated values
      deposit_amount_required: depositAmount,

      // Status
      status: 'new',

      // Metadata
      metadata: {
        monthly_rate_calculation: monthlyRate,
        submission_source: 'web_form',
        user_agent: formData.get('user_agent') || null,
      },
    };

    // Insert into database
    const { data: insertedData, error: insertError } = await supabase
      .from('water_service_requests')
      .insert(record)
      .select('id')
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return {
        success: false,
        error: 'Failed to save request. Please try again.',
      };
    }

    return {
      success: true,
      id: insertedData.id,
    };

  } catch (error) {
    console.error('Server action error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}
