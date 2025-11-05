# 🚀 Complete Database Setup - 2 Minutes

Your storage buckets are ready! Now let's complete the database schema.

## Quick Setup (Copy & Paste)

### Step 1: Open Supabase SQL Editor

Click this link → **[Open SQL Editor](https://supabase.com/dashboard/project/jsxoevmgtjrflwmsevsc/sql/new)**

### Step 2: Copy the SQL

```bash
# This command will copy the SQL to your clipboard
cat database/SAFE_RERUN_SCHEMA.sql | pbcopy  # Mac
# OR
cat database/SAFE_RERUN_SCHEMA.sql | xclip -selection clipboard  # Linux
# OR
cat database/SAFE_RERUN_SCHEMA.sql | clip  # Windows
```

Or open the file manually: `database/SAFE_RERUN_SCHEMA.sql`

### Step 3: Paste and Run

1. Paste into the SQL Editor
2. Click **"Run"** button (bottom right)
3. Wait ~2-3 seconds
4. You should see: ✅ **"Success. No rows returned"**

---

## Verify It Worked

Run the verification script:

```bash
node verify-supabase-setup.js
```

You should see:
```
🎉 All checks passed! Your Supabase setup is complete.

✅ Ready for:
   • Local development (npm run dev)
   • Form submissions
   • File uploads
   • Production deployment
```

---

## What This SQL Does

✅ Creates 4 enums for type safety
✅ Creates `water_service_requests` table (52+ columns)
✅ Creates `audit_logs` table for tracking changes
✅ Creates `admin_users` table for authentication
✅ Sets up 7 indexes for query performance
✅ Adds 2 triggers for auto-timestamps
✅ Configures 8 RLS (Row Level Security) policies
✅ Creates 3 views for reporting

**Safe to run multiple times** - Won't delete existing data!

---

## Troubleshooting

### If you see "relation already exists"

That's OK! It means some parts are already created. The script skips existing objects.

### If you see permission errors

Make sure you're logged in to the correct Supabase project:
- Project: jsxoevmgtjrflwmsevsc
- Should match: https://jsxoevmgtjrflwmsevsc.supabase.co

### If columns are missing

The script will ADD missing columns (upcoming feature). For now, it creates the full schema.

---

## Alternative: Manual Copy

If command-line copy doesn't work:

1. Open `database/SAFE_RERUN_SCHEMA.sql` in your text editor
2. Select All (Ctrl+A / Cmd+A)
3. Copy (Ctrl+C / Cmd+C)
4. Go to [SQL Editor](https://supabase.com/dashboard/project/jsxoevmgtjrflwmsevsc/sql/new)
5. Paste (Ctrl+V / Cmd+V)
6. Click Run

---

## After Setup Complete

Your full stack is ready:

```bash
# Test locally
npm run dev
# Visit http://localhost:3000
# Fill and submit form
# Check Supabase Table Editor for data

# Deploy to production
./deploy-to-vercel.sh
```

---

**Direct Link:** https://supabase.com/dashboard/project/jsxoevmgtjrflwmsevsc/sql/new
