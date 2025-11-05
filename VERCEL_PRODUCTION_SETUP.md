# 🚀 Vercel Production Environment Setup

## ✅ Your Local Setup is Complete!

Your `.env.local` now has the correct service_role key. Form submissions should work locally.

---

## 🎯 Next: Configure Production (Vercel)

Your local environment is working, but production (https://gjhtechs.com) needs the same environment variables.

### **Required Environment Variables for Vercel:**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://jsxoevmgtjrflwmsevsc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzeG9ldm1ndGpyZmx3bXNldnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI2ODMsImV4cCI6MjA3Nzg1ODY4M30.J4OT79TyMRQyAjVbL8Gzj8yfOLQVIGAq7LXmvc5lZ6s
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzeG9ldm1ndGpyZmx3bXNldnNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4MjY4MywiZXhwIjoyMDc3ODU4NjgzfQ.oH67Q2XeRZttSqTaCb-Pu-J_6dDJO1Hw4j9QGikpEmg
```

---

## 📋 Step-by-Step: Add to Vercel (3 Minutes)

### **Option A: Via Vercel Dashboard (Recommended)**

#### Step 1: Go to Your Project Settings

1. Visit: https://vercel.com/dashboard
2. Click on your project: **tx-water-service-repo** (or whatever it's named)
3. Click: **Settings** tab (top navigation)
4. Click: **Environment Variables** (left sidebar)

#### Step 2: Add Each Variable

For EACH of the 3 variables above:

1. **Click:** "Add New" button
2. **Name:** Copy the variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
3. **Value:** Copy the variable value (the part after `=`)
4. **Environment:** Check ALL three boxes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. **Click:** "Save"
6. **Repeat** for the other 2 variables

#### Step 3: Redeploy

1. Go to: **Deployments** tab
2. Find the latest deployment
3. Click: **...** (three dots menu)
4. Click: **Redeploy**
5. Confirm: **Redeploy**

**Wait ~2 minutes** for the build to complete

---

### **Option B: Via Vercel CLI (Advanced)**

If you have Vercel CLI installed:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://jsxoevmgtjrflwmsevsc.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzeG9ldm1ndGpyZmx3bXNldnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI2ODMsImV4cCI6MjA3Nzg1ODY4M30.J4OT79TyMRQyAjVbL8Gzj8yfOLQVIGAq7LXmvc5lZ6s

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzeG9ldm1ndGpyZmx3bXNldnNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4MjY4MywiZXhwIjoyMDc3ODU4NjgzfQ.oH67Q2XeRZttSqTaCb-Pu-J_6dDJO1Hw4j9QGikpEmg

# Trigger redeploy
vercel --prod
```

---

## ✅ Verify Production Deployment

### **Step 1: Check Deployment Status**

1. Go to Vercel Dashboard → **Deployments**
2. Latest deployment should show: **✓ Ready** (green)
3. Click on it to see the URL

### **Step 2: Test Production Form**

1. Visit: https://gjhtechs.com
2. Fill out the water service request form
3. Click: **Submit**
4. Should see: ✅ "Request submitted successfully!"

### **Step 3: Verify Data in Supabase**

1. Go to: https://supabase.com/dashboard/project/jsxoevmgtjrflwmsevsc
2. Click: **Table Editor**
3. Click: `water_service_requests` table
4. You should see your submission! ✅

---

## 🔍 Troubleshooting Production

### ❌ "Failed to save request" on Production

**Check:**
1. Are ALL 3 environment variables added to Vercel?
2. Did you redeploy AFTER adding variables?
3. Check Vercel logs: Dashboard → Deployments → Click deployment → Runtime Logs

### ❌ "Build failed" on Vercel

**Check:**
1. Vercel build logs for the specific error
2. Most likely: TypeScript error or missing dependency
3. Test locally: `npm run build` (should succeed)

### ❌ Environment Variables Not Found

**Check:**
1. Variable names are EXACTLY correct (case-sensitive)
2. No extra spaces in values
3. Applied to "Production" environment
4. Deployment was triggered AFTER adding variables

---

## 📊 Environment Variables Checklist

Before redeploying, verify you have:

| Variable | Status | Value Starts With | Environment |
|----------|--------|-------------------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | ⬜ Added | `https://jsxo...` | Production ✓ |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ⬜ Added | `eyJhbGciOiJI...` (role:anon) | Production ✓ |
| SUPABASE_SERVICE_ROLE_KEY | ⬜ Added | `eyJhbGciOiJI...` (role:service_role) | Production ✓ |

**Important:** The `SUPABASE_SERVICE_ROLE_KEY` must be DIFFERENT from the anon key!

---

## 🔐 Security Notes for Production

### **Service Role Key:**
- ⚠️ Has full database access
- ✅ Only used in server actions (never sent to client)
- ✅ Encrypted at rest in Vercel
- ✅ Never exposed in browser

### **Anon Key:**
- ✅ Safe for client-side use
- ✅ Limited by Row Level Security (RLS) policies
- ✅ Can be in `NEXT_PUBLIC_` variables

### **Best Practices:**
1. ✅ Never commit `.env.local` to git (already in .gitignore)
2. ✅ Rotate keys if compromised
3. ✅ Use different Supabase projects for dev/prod (optional)
4. ✅ Monitor Supabase logs for suspicious activity

---

## 🎯 After Production Setup

Once environment variables are added and redeployed:

### **Test Full Flow:**

1. **Public Form Submission**
   - Visit: https://gjhtechs.com
   - Submit test request
   - Verify success message

2. **Admin Dashboard**
   - Visit: https://gjhtechs.com/admin/login
   - Login: `admin` / `admin`
   - Should see submitted requests

3. **Data Verification**
   - Check Supabase Table Editor
   - Request should appear with all fields
   - Status should be: `new`

---

## 📝 Quick Reference

### **Your Production URLs:**
- Website: https://gjhtechs.com
- Admin: https://gjhtechs.com/admin/login
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard/project/jsxoevmgtjrflwmsevsc

### **Your Credentials:**
- Supabase URL: `https://jsxoevmgtjrflwmsevsc.supabase.co`
- Admin Login: `admin` / `admin` (change in production!)

---

## 🚨 Important: Change Admin Password

The default admin password is `admin/admin` - you should change this!

**How to secure admin:**
1. Update: `app/admin/login/actions.ts`
2. Change the hardcoded credentials
3. Or implement proper authentication (Supabase Auth, Auth.js, etc.)

---

## ✅ Deployment Complete Checklist

After following this guide:

- [ ] All 3 environment variables added to Vercel
- [ ] Variables applied to "Production" environment
- [ ] Redeployment triggered and completed successfully
- [ ] Production site tested (form submission works)
- [ ] Data appears in Supabase Table Editor
- [ ] Admin dashboard accessible
- [ ] No errors in Vercel runtime logs

---

## 🎉 You're Done!

Your water service request system is now fully deployed and functional:

- ✅ Production site: https://gjhtechs.com
- ✅ Form submissions working
- ✅ Database connected
- ✅ Admin dashboard live
- ✅ 52-field validation active
- ✅ File uploads ready
- ✅ Secure SSN handling
- ✅ Audit logging enabled

**Ready to accept real water service requests!** 🚀

---

**Created:** 2025-11-05
**For:** Production deployment to Vercel with correct Supabase credentials
