# Supabase Database Setup Guide

## Quick Start (5 Minutes)

### ✅ Step 1: Run the SQL Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (or create a new one)
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the **ENTIRE contents** of `database/SAFE_RERUN_SCHEMA.sql`
6. Paste into the SQL editor
7. Click **Run** (green play button)

✅ **Result:** You should see "Success. No rows returned" - that's perfect!

---

## What This Script Creates

### 📊 **Database Objects Created:**

| Object | Count | Purpose |
|--------|-------|---------|
| **Enums** | 4 | Type-safe status values |
| **Tables** | 3 | Main requests + admin + audit log |
| **Indexes** | 7 | Query performance optimization |
| **Functions** | 2 | Auto-update timestamps + account numbers |
| **Triggers** | 2 | Automatic field updates |
| **Policies** | 8 | Row-level security |
| **Views** | 3 | Common dashboard queries |

---

## Database Schema Details

### 🗂️ **Main Table: `water_service_requests`**

**52 fields organized into sections:**

#### System Fields (4)
- `id` - UUID primary key
- `created_at` - Timestamp
- `updated_at` - Auto-updated timestamp
- `status` - Current workflow state

#### Primary Applicant (13 fields)
- Name, email, phone numbers
- Driver's license + state
- Date of birth
- SSN (encrypted + last 4)
- Signature + metadata

#### Co-Applicant (11 fields)
- Same as primary applicant
- Optional (controlled by `has_co_applicant` flag)

#### Addresses (9 fields)
- Service address (where water goes)
- Mailing address (for bills)
- City, state, postal code for each

#### Property Details (8 fields)
- Property use type (rent/own/lease)
- Landlord info (if rental)
- Document uploads (lease/deed)
- Features (pool, sprinkler)

#### Services (4 fields)
- Trash cart count
- Recycle cart count
- Additional cart fees

#### Billing (4 fields)
- Bill type preference
- Account number (auto-generated)
- Customer PIN
- Service territory

#### Financial (9 fields)
- Credit check results
- Deposit amount
- Payment tracking

#### Work Orders (9 fields)
- Meter activation
- Trash delivery
- Recycle delivery
- (work order #, scheduled date, completed date for each)

#### Integration (4 fields)
- External system ID (e.g., IRIS)
- Sync status
- Error tracking

#### Legal/Compliance (6 fields)
- Service terms acknowledgment
- Welcome packet tracking

#### Administrative (2 fields)
- Staff notes
- Internal comments (JSON array)

#### Metadata (1 field)
- Flexible JSONB for future fields

---

## Enums (Type System)

### `water_request_status`
```
new → pending_documents → pending_landlord_verification →
pending_credit_check → pending_deposit → approved →
scheduled_activation → active → [suspended] → completed/cancelled
```

### `property_use_type`
- `rent` - Tenant (requires landlord verification)
- `owner_occupied` - Owner lives there
- `owner_leasing` - Owner rents it out

### `bill_type_preference`
- `mail` - Paper bill
- `email` - Electronic bill
- `both` - Both formats

### `service_territory`
- `inside_city_limits` - City rates
- `outside_city_limits` - County rates

---

## Automatic Features

### 🤖 **Triggers**

#### 1. Auto-Update Timestamp
Every time a record is updated, `updated_at` is automatically set to current time.

#### 2. Auto-Generate Account Number
When status changes to `approved`, automatically generates account number:
- Format: `YYYY-NNNNN` (e.g., `2025-00001`)
- Sequential numbering
- Only generated once

### 🔒 **Row Level Security (RLS)**

#### Public Access
- ✅ Anonymous users can INSERT (submit forms)

#### Authenticated Users
- ✅ Can view their own requests (by email match)

#### Service Role (Backend)
- ✅ Full access to all operations

#### Admin Users
- ✅ Read, Update, Delete all requests
- ✅ View audit logs

---

## Storage Buckets Setup

After running the SQL, create storage buckets for file uploads:

### 📁 **Bucket 1: `documents`**

1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket**
3. **Name:** `documents`
4. **Public:** ❌ No (Private)
5. **File size limit:** 10 MB
6. **Allowed MIME types:**
   - `application/pdf`
   - `image/jpeg`
   - `image/png`
   - `image/heic`
7. Click **Create bucket**

**Purpose:** Stores lease agreements and property deeds

### 📁 **Bucket 2: `signatures`**

1. Click **New bucket** again
2. **Name:** `signatures`
3. **Public:** ❌ No (Private)
4. **File size limit:** 2 MB
5. **Allowed MIME types:**
   - `image/png`
   - `image/jpeg`
6. Click **Create bucket**

**Purpose:** Stores applicant signature images

---

## Security Features

### 🔐 **SSN Encryption**

SSN is handled with maximum security:

1. **Input:** Masked password field in UI
2. **Transmission:** HTTPS only
3. **Storage:**
   - `applicant_ssn_last4`: Last 4 digits in plaintext (for display)
   - `applicant_ssn_encrypted`: Full SSN encrypted with `pgp_sym_encrypt`
4. **Retrieval:** Only via service role, never sent to client

**To encrypt SSN in your backend:**
```typescript
// In your server action
const encrypted = await supabase.rpc('encrypt_ssn', {
  ssn: fullSSN,
  key: process.env.SSN_ENCRYPTION_KEY
});
```

### 🛡️ **Row Level Security**

All tables have RLS enabled. Policies enforce:
- Users can only see their own data
- Admins can see all data
- Public can submit but not read
- Service role (your backend) has full access

---

## Helper Views

### 📊 **Dashboard Queries**

Three pre-built views for common queries:

#### 1. `pending_activations`
Shows all approved requests waiting for meter activation:
```sql
SELECT * FROM pending_activations;
```

#### 2. `pending_landlord_verifications`
Shows rental properties needing landlord verification:
```sql
SELECT * FROM pending_landlord_verifications;
```

#### 3. `pending_deposits`
Shows requests requiring deposit payment:
```sql
SELECT * FROM pending_deposits;
```

---

## Testing the Database

### ✅ **Verify Setup**

Run these queries to confirm everything works:

```sql
-- 1. Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'water%';
-- Should return: water_service_requests, water_request_audit_log

-- 2. Check enums exist
SELECT typname
FROM pg_type
WHERE typname LIKE '%water%' OR typname LIKE '%property%';
-- Should return: water_request_status, property_use_type, etc.

-- 3. Check indexes
SELECT indexname
FROM pg_indexes
WHERE tablename = 'water_service_requests';
-- Should return 7 indexes

-- 4. Check policies
SELECT policyname
FROM pg_policies
WHERE tablename = 'water_service_requests';
-- Should return 6 policies

-- 5. Insert test record (as service role)
INSERT INTO water_service_requests (
  applicant_name,
  applicant_email,
  applicant_phone,
  service_address,
  property_use_type,
  bill_type_preference
) VALUES (
  'John Doe',
  'john@example.com',
  '5551234567',
  '123 Main St',
  'owner_occupied',
  'email'
);
-- Should succeed and return the UUID

-- 6. Query test record
SELECT id, applicant_name, status, created_at
FROM water_service_requests
ORDER BY created_at DESC
LIMIT 1;
-- Should show your test record with status 'new'
```

---

## Environment Variables

After database setup, add these to your application:

### 🔑 **Required Variables**

#### For Local Development (`.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SSN_ENCRYPTION_KEY=your-32-byte-random-key
```

#### For Vercel Production
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add each variable above
3. Set **Environment:** Production
4. Click **Save**

**To get Supabase credentials:**
1. Supabase Dashboard → Project Settings → API
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (click Reveal) → `SUPABASE_SERVICE_ROLE_KEY`

---

## Troubleshooting

### ❌ **"relation already exists"**
✅ **Solution:** This is OKAY! The script uses `create if not exists`, so it safely skips existing objects.

### ❌ **"permission denied"**
✅ **Solution:** Make sure you're running the script in Supabase SQL Editor as the project owner.

### ❌ **"type already exists"**
✅ **Solution:** This is OKAY! Enums are created with safety checks.

### ❌ **"policy already exists"**
✅ **Solution:** This is OKAY! Old policies are dropped before creating new ones.

### ❌ **Cannot insert - RLS denies**
✅ **Solution:**
- Public inserts should use `anon` key
- Backend operations should use `service_role` key
- Check your Supabase client initialization

---

## Next Steps After Database Setup

1. ✅ **Test form submission locally:**
   ```bash
   npm run dev
   # Visit http://localhost:3000
   ```

2. ✅ **Check data appears in Supabase:**
   - Go to **Table Editor**
   - Select `water_service_requests`
   - See your submissions

3. ✅ **Deploy to Vercel:**
   ```bash
   git push origin master
   # Vercel auto-deploys
   ```

4. ✅ **Test production site:**
   - Visit https://gjhtechs.com
   - Submit a test request
   - Verify in Supabase Table Editor

---

## Database Maintenance

### 🔄 **Re-Running the Script**

The script is **100% safe** to run multiple times:
- Won't drop existing data
- Won't duplicate records
- Won't break existing tables
- Updates policies/triggers safely

**When to re-run:**
- After schema updates
- To reset policies/triggers
- To add new indexes
- To update views

### 🗑️ **Clean Slate (Development Only)**

If you want to start fresh:

```sql
-- WARNING: This deletes ALL data!
DROP TABLE IF EXISTS public.water_service_requests CASCADE;
DROP TABLE IF EXISTS public.water_request_audit_log CASCADE;
DROP TABLE IF EXISTS public.admins CASCADE;
DROP TYPE IF EXISTS public.water_request_status CASCADE;
DROP TYPE IF EXISTS public.property_use_type CASCADE;
DROP TYPE IF EXISTS public.bill_type_preference CASCADE;
DROP TYPE IF EXISTS public.service_territory CASCADE;
DROP SEQUENCE IF EXISTS account_number_seq CASCADE;

-- Then run SAFE_RERUN_SCHEMA.sql again
```

---

## Summary Checklist

- [ ] Run `SAFE_RERUN_SCHEMA.sql` in Supabase SQL Editor
- [ ] Create `documents` storage bucket
- [ ] Create `signatures` storage bucket
- [ ] Get Supabase credentials from API settings
- [ ] Add environment variables to `.env.local`
- [ ] Add environment variables to Vercel
- [ ] Test form locally (`npm run dev`)
- [ ] Verify data in Supabase Table Editor
- [ ] Deploy to production
- [ ] Test production form

---

**🎉 Database setup complete! Your water service request system is ready to accept submissions.**
