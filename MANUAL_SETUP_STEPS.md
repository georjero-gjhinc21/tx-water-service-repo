# ⚡ Manual Supabase Setup Steps

## 🔍 What We Found

✅ **Connection successful** to: `https://jsxoevmgtjrflwmsevsc.supabase.co`
⚠️  **Limitation:** The anon key provided doesn't have permissions to:
- Execute raw SQL
- Create storage buckets

**Solution:** Complete these 3 quick manual steps in Supabase Dashboard

---

## 📋 Step-by-Step Instructions (5 minutes)

### ✅ STEP 1: Run the SQL Migration

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/jsxoevmgtjrflwmsevsc

2. **Navigate to SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Copy the SQL Script**
   - Open file: `database/SAFE_RERUN_SCHEMA.sql` in this repo
   - Copy **ALL** contents (Ctrl+A, Ctrl+C)

4. **Paste and Run**
   - Paste into the SQL editor
   - Click **Run** (green play button ▶️)

5. **Verify Success**
   - You should see: "Success. No rows returned"
   - ✅ This means all tables/triggers/policies were created!

---

### ✅ STEP 2: Create Storage Buckets

#### Bucket 1: "documents"

1. **Navigate to Storage**
   - Click **Storage** in the left sidebar
   - Click **New bucket**

2. **Configure Bucket**
   - **Name:** `documents`
   - **Public bucket:** ❌ **NO** (keep private)
   - **File size limit:** `10` MB
   - **Allowed MIME types:**
     - `application/pdf`
     - `image/jpeg`
     - `image/png`
     - `image/heic`

3. **Create**
   - Click **Create bucket**

#### Bucket 2: "signatures"

1. **Create Another Bucket**
   - Click **New bucket** again

2. **Configure Bucket**
   - **Name:** `signatures`
   - **Public bucket:** ❌ **NO** (keep private)
   - **File size limit:** `2` MB
   - **Allowed MIME types:**
     - `image/png`
     - `image/jpeg`

3. **Create**
   - Click **Create bucket**

---

### ✅ STEP 3: Get Service Role Key (Important!)

1. **Go to Project Settings**
   - Click the ⚙️ **Settings** icon (bottom left)
   - Click **API** in the left menu

2. **Reveal Service Role Key**
   - Find the **service_role** section
   - Click **Reveal** button
   - **Copy the entire key** (it's very long, starts with `eyJ...`)

3. **Update .env.local**
   - Open `.env.local` in this repo
   - Replace `your_service_role_key_here` with the key you copied
   - **Save the file**

---

## ✅ STEP 4: Add to Vercel (Production)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Add Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Add these 3 variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://jsxoevmgtjrflwmsevsc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzeG9ldm1ndGpyZmx3bXNldnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI2ODMsImV4cCI6MjA3Nzg1ODY4M30.J4OT79TyMRQyAjVbL8Gzj8yfOLQVIGAq7LXmvc5lZ6s
SUPABASE_SERVICE_ROLE_KEY = [paste the service_role key you got from step 3]
```

3. **Set Environment**
   - For each variable, select: **Production**, **Preview**, **Development**
   - Click **Save**

4. **Redeploy**
   - Go to **Deployments**
   - Click **...** (three dots) on latest deployment
   - Click **Redeploy**

---

## 🧪 Testing & Verification

### Test Locally

```bash
# Make sure .env.local has the service_role key
npm run dev

# Visit http://localhost:3000
# Fill out and submit the form
# Check Supabase Table Editor to see the data
```

### Verify in Supabase

1. **Check Tables Created**
   ```sql
   -- Go to SQL Editor and run:
   SELECT tablename FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename LIKE 'water%';

   -- Should return:
   -- water_service_requests
   -- water_request_audit_log
   ```

2. **Check Buckets**
   - Go to **Storage**
   - Should see: `documents` and `signatures`

3. **Test Insert**
   - Submit a test form locally
   - Go to **Table Editor**
   - Click `water_service_requests`
   - Should see your test submission

---

## 📊 What Gets Created

### Database Objects

| Type | Name | Purpose |
|------|------|---------|
| **Table** | water_service_requests | Main form data (52 fields) |
| **Table** | admins | Admin user management |
| **Table** | water_request_audit_log | Audit trail |
| **Enum** | water_request_status | Status values |
| **Enum** | property_use_type | Property ownership types |
| **Enum** | bill_type_preference | Billing preferences |
| **Enum** | service_territory | Service area types |
| **Index** | 7 indexes | Query performance |
| **Trigger** | updated_at | Auto-update timestamps |
| **Trigger** | generate_account | Auto-generate account# |
| **Policy** | 8 RLS policies | Security rules |
| **View** | pending_activations | Dashboard helper |
| **View** | pending_landlord_verifications | Dashboard helper |
| **View** | pending_deposits | Dashboard helper |

### Storage Buckets

| Name | Size Limit | Purpose | Files Allowed |
|------|-----------|---------|---------------|
| documents | 10 MB | Lease/deed uploads | PDF, JPG, PNG, HEIC |
| signatures | 2 MB | Signature images | PNG, JPG |

---

## ❓ Troubleshooting

### "Table already exists"
✅ **This is OK!** The script is idempotent (safe to run multiple times)

### "Bucket already exists"
✅ **This is OK!** Just means it was created already

### "Permission denied"
❌ Make sure you're logged in as the project owner

### Form doesn't submit
- ❌ Check `.env.local` has the correct service_role key
- ❌ Check Vercel has all 3 environment variables
- ❌ Check browser console for errors

### Can't see submitted data
- ❌ Check Table Editor → `water_service_requests`
- ❌ Make sure SQL migration ran successfully
- ❌ Check browser network tab for API errors

---

## ✅ Completion Checklist

After completing all steps, verify:

- [ ] SQL migration ran successfully (no errors in SQL Editor)
- [ ] `documents` bucket created
- [ ] `signatures` bucket created
- [ ] Service role key added to `.env.local`
- [ ] All 3 variables added to Vercel
- [ ] Vercel redeployed
- [ ] Test form works locally (`npm run dev`)
- [ ] Test form works in production (https://gjhtechs.com)
- [ ] Data appears in Supabase Table Editor

---

## 🎉 When Complete

Your water service request system will be **fully functional** with:

- ✅ 52-field form with validation
- ✅ Database storage with proper schema
- ✅ File uploads (lease/deed documents)
- ✅ Signature capture
- ✅ Admin dashboard at `/admin` (login: admin/admin)
- ✅ Status workflow tracking
- ✅ Audit logging
- ✅ Row-level security
- ✅ Production-ready deployment

---

## 📞 Need Help?

If you encounter issues:

1. Check browser console (F12) for errors
2. Check Vercel deployment logs
3. Check Supabase logs (Dashboard → Logs)
4. Review `DATABASE_SETUP_GUIDE.md` for details
5. Review `VALIDATION_GUIDE.md` for form validation info

---

**Created:** 2025-11-05
**Project:** jsxoevmgtjrflwmsevsc.supabase.co
**Status:** Ready for manual setup (3 quick steps above)
