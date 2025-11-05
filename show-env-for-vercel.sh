#!/bin/bash

# Display environment variables in Vercel-ready format
# Use this if you prefer to manually add variables via the Vercel Dashboard

set -e

echo "📋 Environment Variables for Vercel Dashboard"
echo "=============================================="
echo ""
echo "Copy these values to add manually in Vercel Dashboard:"
echo "https://vercel.com/dashboard → Your Project → Settings → Environment Variables"
echo ""
echo "----------------------------------------------------------------------"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local not found!"
  exit 1
fi

# Source environment variables
source .env.local

echo "1️⃣  NEXT_PUBLIC_SUPABASE_URL"
echo "   Value: $NEXT_PUBLIC_SUPABASE_URL"
echo "   Environments: ✅ Production  ✅ Preview  ✅ Development"
echo ""

echo "2️⃣  NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   Value: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   Environments: ✅ Production  ✅ Preview  ✅ Development"
echo ""

echo "3️⃣  SUPABASE_SERVICE_ROLE_KEY"
echo "   Value: $SUPABASE_SERVICE_ROLE_KEY"
echo "   Environments: ✅ Production  ✅ Preview  ✅ Development"
echo ""

if [ -n "$SSN_ENCRYPTION_KEY" ] && [ "$SSN_ENCRYPTION_KEY" != "change-this-to-random-32-characters" ]; then
  echo "4️⃣  SSN_ENCRYPTION_KEY (Optional)"
  echo "   Value: $SSN_ENCRYPTION_KEY"
  echo "   Environments: ✅ Production  ✅ Preview  ✅ Development"
  echo ""
fi

echo "----------------------------------------------------------------------"
echo ""
echo "⚠️  IMPORTANT: After adding all variables, REDEPLOY your project!"
echo ""
echo "📖 See VERCEL_PRODUCTION_SETUP.md for detailed step-by-step instructions"
echo ""
