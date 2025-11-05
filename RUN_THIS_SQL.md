# 🚨 CRITICAL: Run Database Schema Migration

## ⚠️ Current Issue

**Admin dashboard not working** because the database table is **missing 52 columns**.

The table `water_service_requests` exists but only has ~10 columns. It needs all 52+ columns for the form to work.

---

## ✅ Fix (2 Minutes)

### Step 1: Open Supabase SQL Editor

**Click this link:** https://supabase.com/dashboard/project/jsxoevmgtjrflwmsevsc/sql/new

### Step 2: Copy the SQL

```bash
# In terminal, copy the SQL to clipboard:
cat database/SAFE_RERUN_SCHEMA.sql | pbcopy  # Mac
# OR
cat database/SAFE_RERUN_SCHEMA.sql | xclip -selection clipboard  # Linux
# OR manually open database/SAFE_RERUN_SCHEMA.sql and copy all
```

### Step 3: Run in Supabase

1. Paste the SQL into the editor
2. Click **"Run"** button (bottom right)
3. Should see: **"Success. No rows returned"** ✅

### Step 4: Verify

```bash
node test-actual-insert.js
# Should show: ✅ All tests passed!
```

---

## 🎯 What This SQL Does

Creates/updates the complete schema with:
- ✅ All 52+ form field columns
- ✅ RLS policies for public insert + admin access
- ✅ Storage bucket policies
- ✅ Triggers for auto-timestamps
- ✅ Indexes for performance

**Safe to run multiple times** - won't delete existing data!

---

## 📊 After Running SQL

✅ Admin dashboard will work
✅ Form submissions will work with all 52 fields
✅ PDF download will work (implementing next)

---

**THIS IS THE BLOCKER - Run this SQL first before anything else!**
