# 🔧 Quick Fix: "Failed to save request" Error

## ❌ Problem

You're seeing: **"Failed to save request. Please try again."**

## 🎯 Root Cause

You provided the **anon key** twice instead of the **service_role key**.

**What's happening:**
- The anon key has limited permissions (read-only for public)
- Form submissions need the service_role key (full admin access)
- Currently both keys are the same (both are anon keys)

## ✅ Solution (2 Minutes)

### Step 1: Get the REAL Service Role Key

1. **Go to Supabase API Settings:**
   - Direct link: https://supabase.com/dashboard/project/jsxoevmgtjrflwmsevsc/settings/api

2. **Find the Service Role Key:**
   - Scroll down to "Project API keys"
   - You'll see TWO keys:
     - `anon` key → ✅ You already have this
     - `service_role` key → ⚠️ This is what you need!

3. **Reveal and Copy:**
   - Click **"Reveal"** button next to `service_role`
   - Copy the ENTIRE key
   - It should be DIFFERENT from your anon key
   - It will also start with `eyJhbGci...` but the rest is different

### Step 2: Update .env.local

1. **Open `.env.local` in this repo**

2. **Replace line 17:**
   ```bash
   # Change this line:
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzeG9ldm1ndGpyZmx3bXNldnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI2ODMsImV4cCI6MjA3Nzg1ODY4M30.J4OT79TyMRQyAjVbL8Gzj8yfOLQVIGAq7LXmvc5lZ6s

   # To (with YOUR service_role key):
   SUPABASE_SERVICE_ROLE_KEY=<paste the service_role key you copied>
   ```

3. **Save the file**

### Step 3: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
# Or if using different terminal, kill and restart
```

### Step 4: Test Again

1. Visit http://localhost:3000
2. Fill out the form
3. Submit
4. Should now work! ✅

---

## 📊 How to Verify You Have the Right Key

### ❌ WRONG (both keys are the same):
```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...MTY4M30.J4OT79Ty...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...MTY4M30.J4OT79Ty...  # Same as above ❌
```

### ✅ CORRECT (keys are different):
```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...MTY4M30.J4OT79Ty...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...MTY4M30.XyZ123Ab...  # Different ✅
```

The service_role key should have `"role":"service_role"` in its JWT payload (you can check at https://jwt.io)

---

## 🔍 Also Check

### Did you run the SQL migration?

The database table might not exist yet. Check in Supabase:

1. Go to: **Table Editor**
2. Look for: `water_service_requests` table
3. If NOT there:
   - Go to **SQL Editor**
   - Copy contents of `database/SAFE_RERUN_SCHEMA.sql`
   - Paste and run

### Check the improved error message

After my update, the error will now show the ACTUAL error message:
- Before: "Failed to save request. Please try again."
- After: "Failed to save request: [actual error message]"

This will help diagnose if there are other issues.

---

## 🎉 After Fix

Once you have the correct service_role key:
- ✅ Form submissions will work
- ✅ Data will appear in Supabase Table Editor
- ✅ Admin dashboard will show submissions
- ✅ All CRUD operations will work

---

## 🔐 Security Note

**Service Role Key = Full Admin Access**
- ⚠️ Never commit this to git (it's in .gitignore)
- ⚠️ Never share publicly
- ✅ Only use in server-side code (server actions)
- ✅ Also add to Vercel environment variables for production

---

## Still Having Issues?

After getting the correct key, if you still see errors:

1. **Check browser console** (F12) for detailed errors
2. **Check terminal** where `npm run dev` is running for server logs
3. **Verify .env.local** is in the root directory
4. **Restart dev server** after changing environment variables

The improved error handling will now show you exactly what's wrong!

---

**Created:** 2025-11-05
**Quick fix for:** Service role key misconfiguration
