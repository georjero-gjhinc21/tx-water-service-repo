-- ============================================================================
-- TEXAS WATER SERVICE REQUEST - SAFE RE-RUNNABLE SCHEMA
-- ============================================================================
--
-- This script is SAFE to run multiple times. It will:
-- ✅ Create tables/types/functions if they don't exist
-- ✅ Skip creation if they already exist
-- ✅ Not drop existing data
-- ✅ Update triggers and policies safely
--
-- TO RUN IN SUPABASE:
-- 1. Go to SQL Editor in Supabase Dashboard
-- 2. Copy and paste this ENTIRE script
-- 3. Click "Run" (it's safe even if you've run it before)
--
-- ============================================================================

begin;

-- ============================================================================
-- STEP 1: ENABLE REQUIRED EXTENSIONS
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- STEP 2: CREATE ENUMS (Type System)
-- ============================================================================

do $$
begin
  -- Status enum (11 workflow states)
  if not exists (select 1 from pg_type where typname = 'water_request_status') then
    create type public.water_request_status as enum (
      'new',
      'pending_documents',
      'pending_landlord_verification',
      'pending_credit_check',
      'pending_deposit',
      'approved',
      'scheduled_activation',
      'active',
      'suspended',
      'completed',
      'cancelled'
    );
  end if;

  -- Property use type (rent/own/lease)
  if not exists (select 1 from pg_type where typname = 'property_use_type') then
    create type public.property_use_type as enum (
      'rent',
      'owner_occupied',
      'owner_leasing'
    );
  end if;

  -- Bill delivery preference
  if not exists (select 1 from pg_type where typname = 'bill_type_preference') then
    create type public.bill_type_preference as enum (
      'mail',
      'email',
      'both'
    );
  end if;

  -- Service territory (affects rates)
  if not exists (select 1 from pg_type where typname = 'service_territory') then
    create type public.service_territory as enum (
      'inside_city_limits',
      'outside_city_limits'
    );
  end if;
end;
$$;

-- ============================================================================
-- STEP 3: CREATE MAIN TABLE (52+ fields)
-- ============================================================================

create table if not exists public.water_service_requests (
  -- ========================================================================
  -- SYSTEM FIELDS
  -- ========================================================================
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status public.water_request_status not null default 'new',

  -- Service request metadata
  service_request_date date not null default current_date,
  service_start_date date,
  service_stop_date date,

  -- ========================================================================
  -- PRIMARY APPLICANT INFORMATION
  -- ========================================================================
  applicant_name text not null,
  applicant_email text not null,
  applicant_phone text not null check (length(applicant_phone) between 7 and 20),
  applicant_alternate_phone text check (length(applicant_alternate_phone) between 7 and 20),
  applicant_work_phone text check (length(applicant_work_phone) between 7 and 20),

  -- Identity verification
  applicant_drivers_license_number text,
  applicant_drivers_license_state text,
  applicant_date_of_birth date,
  applicant_ssn_last4 char(4),
  applicant_ssn_encrypted bytea, -- Encrypted with pgp_sym_encrypt

  -- Signature
  applicant_signature_image_path text,
  applicant_signature_timestamp timestamptz,
  applicant_ip_address inet,
  applicant_user_agent text,

  -- ========================================================================
  -- CO-APPLICANT INFORMATION
  -- ========================================================================
  has_co_applicant boolean not null default false,
  co_applicant_name text,
  co_applicant_email text,
  co_applicant_phone text check (length(co_applicant_phone) between 7 and 20),
  co_applicant_alternate_phone text,
  co_applicant_work_phone text,

  -- Co-applicant identity
  co_applicant_drivers_license_number text,
  co_applicant_drivers_license_state text,
  co_applicant_date_of_birth date,
  co_applicant_ssn_last4 char(4),
  co_applicant_ssn_encrypted bytea,

  -- Co-applicant signature
  co_applicant_signature_image_path text,
  co_applicant_signature_timestamp timestamptz,

  -- ========================================================================
  -- SERVICE ADDRESS
  -- ========================================================================
  service_address text not null,
  service_city text,
  service_state text,
  service_postal_code text,

  -- ========================================================================
  -- MAILING ADDRESS
  -- ========================================================================
  mailing_address_same_as_service boolean not null default true,
  mailing_address text,
  mailing_city text,
  mailing_state text,
  mailing_postal_code text,

  -- ========================================================================
  -- PROPERTY USE & OWNERSHIP
  -- ========================================================================
  property_use_type public.property_use_type not null,

  -- For rentals - landlord information
  landlord_name text,
  landlord_phone text check (length(landlord_phone) between 7 and 20),
  landlord_verified boolean default false,
  landlord_verification_date timestamptz,

  -- Property documents
  lease_document_path text,
  lease_document_original_name text,
  lease_document_uploaded_at timestamptz,

  deed_document_path text,
  deed_document_original_name text,
  deed_document_uploaded_at timestamptz,

  -- ========================================================================
  -- SANITATION SERVICES
  -- ========================================================================
  trash_carts_needed int not null default 1 check (trash_carts_needed >= 0 and trash_carts_needed <= 10),
  recycle_carts_needed int not null default 1 check (recycle_carts_needed >= 0 and recycle_carts_needed <= 10),
  additional_trash_cart_fee numeric(10,2),
  additional_recycle_cart_fee numeric(10,2),

  -- ========================================================================
  -- PROPERTY FEATURES
  -- ========================================================================
  has_sprinkler_system boolean not null default false,
  has_pool boolean not null default false,

  -- ========================================================================
  -- BILLING PREFERENCES
  -- ========================================================================
  bill_type_preference public.bill_type_preference not null default 'both',

  -- ========================================================================
  -- ACCOUNT MANAGEMENT
  -- ========================================================================
  account_number text unique,
  customer_pin text,
  service_territory public.service_territory,
  authorized_persons jsonb, -- [{name, phone, relationship, added_date}]

  -- ========================================================================
  -- FINANCIAL
  -- ========================================================================
  credit_check_performed boolean default false,
  credit_check_date timestamptz,
  credit_check_score int,
  credit_check_result text,

  deposit_amount_required numeric(10,2),
  deposit_paid boolean default false,
  deposit_paid_date timestamptz,
  deposit_payment_method text,
  deposit_transaction_id text,

  -- ========================================================================
  -- WORK ORDERS & ACTIVATION
  -- ========================================================================
  meter_activation_work_order_number text,
  meter_activation_scheduled_date date,
  meter_activation_completed_date date,

  trash_delivery_work_order_number text,
  trash_delivery_scheduled_date date,
  trash_delivery_completed_date date,

  recycle_delivery_work_order_number text,
  recycle_delivery_scheduled_date date,
  recycle_delivery_completed_date date,

  -- ========================================================================
  -- INTEGRATION TRACKING
  -- ========================================================================
  external_system_id text,
  external_system_synced boolean default false,
  external_system_sync_date timestamptz,
  external_system_sync_error text,

  -- ========================================================================
  -- LEGAL & COMPLIANCE
  -- ========================================================================
  acknowledged_service_terms boolean not null default false,
  acknowledged_service_terms_text text,
  acknowledged_service_terms_timestamp timestamptz,

  welcome_packet_sent boolean default false,
  welcome_packet_sent_date timestamptz,
  welcome_packet_sent_method text,

  -- ========================================================================
  -- ADMINISTRATIVE NOTES
  -- ========================================================================
  staff_notes text,
  internal_comments jsonb, -- [{user, timestamp, comment}]

  -- ========================================================================
  -- METADATA
  -- ========================================================================
  metadata jsonb not null default '{}'::jsonb,

  -- ========================================================================
  -- CONSTRAINTS
  -- ========================================================================
  constraint valid_co_applicant_data check (
    (has_co_applicant = false) or
    (has_co_applicant = true and co_applicant_name is not null and co_applicant_phone is not null)
  ),

  constraint valid_mailing_address check (
    (mailing_address_same_as_service = true) or
    (mailing_address_same_as_service = false and mailing_address is not null)
  ),

  constraint valid_landlord_info check (
    (property_use_type != 'rent') or
    (property_use_type = 'rent' and landlord_name is not null and landlord_phone is not null)
  ),

  constraint valid_service_dates check (
    service_stop_date is null or service_stop_date >= service_start_date
  )
);

-- ============================================================================
-- STEP 4: CREATE INDEXES (Performance)
-- ============================================================================

create index if not exists water_requests_created_at_idx
  on public.water_service_requests (created_at desc);

create index if not exists water_requests_status_idx
  on public.water_service_requests (status);

create index if not exists water_requests_start_date_idx
  on public.water_service_requests (service_start_date);

create index if not exists water_requests_account_number_idx
  on public.water_service_requests (account_number)
  where account_number is not null;

create index if not exists water_requests_applicant_email_idx
  on public.water_service_requests (applicant_email);

create index if not exists water_requests_property_use_idx
  on public.water_service_requests (property_use_type);

create index if not exists water_requests_activation_schedule_idx
  on public.water_service_requests (meter_activation_scheduled_date)
  where meter_activation_scheduled_date is not null;

-- ============================================================================
-- STEP 5: CREATE FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists water_service_requests_set_updated_at on public.water_service_requests;
create trigger water_service_requests_set_updated_at
before update on public.water_service_requests
for each row
execute function public.set_updated_at();

-- Auto-generate account number when approved
create sequence if not exists account_number_seq start 1;

create or replace function public.generate_account_number()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'approved' and new.account_number is null then
    -- Format: YEAR-SEQUENTIAL (e.g., 2025-00001)
    new.account_number := to_char(now(), 'YYYY') || '-' ||
                          lpad(nextval('account_number_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists water_service_requests_generate_account on public.water_service_requests;
create trigger water_service_requests_generate_account
before update on public.water_service_requests
for each row
when (new.status = 'approved' and old.status != 'approved')
execute function public.generate_account_number();

-- ============================================================================
-- STEP 6: ROW LEVEL SECURITY
-- ============================================================================

alter table public.water_service_requests enable row level security;

-- Public can submit requests (anonymous)
drop policy if exists "Public can insert water requests" on public.water_service_requests;
create policy "Public can insert water requests" on public.water_service_requests
  for insert
  to anon
  with check (true);

-- Applicants can view their own (if authenticated)
drop policy if exists "Applicants can view own requests" on public.water_service_requests;
create policy "Applicants can view own requests" on public.water_service_requests
  for select
  to authenticated
  using (
    applicant_email = auth.jwt() ->> 'email' or
    co_applicant_email = auth.jwt() ->> 'email'
  );

-- Service role (your backend) has full access
drop policy if exists "Service role full access" on public.water_service_requests;
create policy "Service role full access" on public.water_service_requests
  for all
  to service_role
  using (true)
  with check (true);

-- ============================================================================
-- STEP 7: ADMIN TABLE (for staff access)
-- ============================================================================

create table if not exists public.admins (
  user_id uuid primary key,
  created_at timestamptz not null default now(),
  full_name text,
  role text default 'admin'
);

alter table public.admins enable row level security;

drop policy if exists "Self can read admin row" on public.admins;
create policy "Self can read admin row" on public.admins
  for select
  to authenticated
  using (user_id = auth.uid());

-- Admin policies for water_service_requests
drop policy if exists "Admins can read water requests" on public.water_service_requests;
create policy "Admins can read water requests" on public.water_service_requests
  for select
  to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "Admins can update water requests" on public.water_service_requests;
create policy "Admins can update water requests" on public.water_service_requests
  for update
  to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "Admins can delete water requests" on public.water_service_requests;
create policy "Admins can delete water requests" on public.water_service_requests
  for delete
  to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- ============================================================================
-- STEP 8: AUDIT LOG TABLE
-- ============================================================================

create table if not exists public.water_request_audit_log (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.water_service_requests(id) on delete cascade,
  timestamp timestamptz not null default now(),
  user_id uuid,
  user_email text,
  action text not null,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text
);

create index if not exists water_request_audit_log_request_id_idx
  on public.water_request_audit_log(request_id);

create index if not exists water_request_audit_log_timestamp_idx
  on public.water_request_audit_log(timestamp desc);

alter table public.water_request_audit_log enable row level security;

drop policy if exists "Admins can read audit log" on public.water_request_audit_log;
create policy "Admins can read audit log" on public.water_request_audit_log
  for select
  to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- ============================================================================
-- STEP 9: HELPER VIEWS (for dashboard queries)
-- ============================================================================

-- View for pending activations
create or replace view public.pending_activations as
select
  id,
  account_number,
  applicant_name,
  applicant_email,
  applicant_phone,
  service_address,
  meter_activation_scheduled_date,
  status,
  property_use_type,
  deposit_paid,
  created_at
from public.water_service_requests
where status in ('approved', 'scheduled_activation')
  and meter_activation_scheduled_date is not null
order by meter_activation_scheduled_date;

-- View for rental verifications needed
create or replace view public.pending_landlord_verifications as
select
  id,
  applicant_name,
  applicant_email,
  applicant_phone,
  service_address,
  landlord_name,
  landlord_phone,
  landlord_verified,
  created_at
from public.water_service_requests
where property_use_type = 'rent'
  and (landlord_verified = false or landlord_verified is null)
  and status not in ('cancelled', 'completed')
order by created_at;

-- View for deposit tracking
create or replace view public.pending_deposits as
select
  id,
  account_number,
  applicant_name,
  applicant_email,
  applicant_phone,
  deposit_amount_required,
  deposit_paid,
  credit_check_result,
  status,
  created_at
from public.water_service_requests
where deposit_amount_required > 0
  and deposit_paid = false
  and status not in ('cancelled', 'completed')
order by created_at;

-- ============================================================================
-- STEP 10: ADD HELPFUL COMMENTS
-- ============================================================================

comment on table public.water_service_requests is
'Complete Texas municipal water service request form - includes water, trash, and recycling services';

comment on column public.water_service_requests.applicant_ssn_encrypted is
'Full SSN encrypted with pgp_sym_encrypt - only last 4 stored in plaintext';

comment on column public.water_service_requests.property_use_type is
'Critical field: rent requires landlord verification, owner types require deed, affects deposit amount';

comment on column public.water_service_requests.service_territory is
'Inside vs outside city limits - affects utility rates and service area';

commit;

-- ============================================================================
-- SUCCESS! Schema is ready.
-- ============================================================================
--
-- NEXT STEPS:
-- 1. Create Storage Buckets in Supabase Dashboard > Storage:
--    - Bucket name: "documents" (Private)
--    - Bucket name: "signatures" (Private)
--
-- 2. Add Environment Variables to Vercel:
--    - NEXT_PUBLIC_SUPABASE_URL
--    - NEXT_PUBLIC_SUPABASE_ANON_KEY
--    - SUPABASE_SERVICE_ROLE_KEY
--
-- 3. Test the form at your deployment URL!
--
-- ============================================================================
