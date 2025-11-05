#!/bin/bash

# Vercel Production Deployment Script
# Automatically configures environment variables and triggers deployment

set -e  # Exit on error

echo "🚀 Vercel Production Deployment Script"
echo "======================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local not found!"
  echo "   Please create it first with your Supabase credentials."
  exit 1
fi

# Source environment variables
source .env.local

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "⚠️  Vercel CLI not found. Installing..."
  npm i -g vercel
  echo "✅ Vercel CLI installed"
  echo ""
fi

# Check if logged in
echo "🔍 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
  echo "⚠️  Not logged in to Vercel. Please login:"
  vercel login
  echo ""
fi

echo "✅ Authenticated with Vercel"
echo ""

# Link to project (if not already linked)
echo "🔗 Linking to Vercel project..."
if [ ! -f .vercel/project.json ]; then
  echo "   This will link your local directory to your Vercel project"
  vercel link
else
  echo "✅ Already linked to Vercel project"
fi
echo ""

# Add environment variables
echo "📝 Adding environment variables to Vercel..."
echo ""

# Function to add or update environment variable
add_env_var() {
  local var_name=$1
  local var_value=$2
  local environment=$3  # production, preview, development

  echo "   Adding $var_name to $environment..."

  # Remove existing variable if it exists (suppress errors)
  vercel env rm "$var_name" "$environment" -y &> /dev/null || true

  # Add the variable
  echo "$var_value" | vercel env add "$var_name" "$environment"
}

# Add each variable to all environments
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  add_env_var "NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL" "production"
  add_env_var "NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL" "preview"
  add_env_var "NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL" "development"
  echo "✅ NEXT_PUBLIC_SUPABASE_URL added to all environments"
else
  echo "❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
  exit 1
fi

if [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  add_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_ANON_KEY" "production"
  add_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_ANON_KEY" "preview"
  add_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_ANON_KEY" "development"
  echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY added to all environments"
else
  echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local"
  exit 1
fi

if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  add_env_var "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY" "production"
  add_env_var "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY" "preview"
  add_env_var "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY" "development"
  echo "✅ SUPABASE_SERVICE_ROLE_KEY added to all environments"
else
  echo "❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local"
  exit 1
fi

echo ""
echo "🎉 All environment variables added successfully!"
echo ""

# Optional: Add SSN encryption key if it exists and isn't placeholder
if [ -n "$SSN_ENCRYPTION_KEY" ] && [ "$SSN_ENCRYPTION_KEY" != "change-this-to-random-32-characters" ]; then
  echo "🔐 Found SSN_ENCRYPTION_KEY, adding to Vercel..."
  add_env_var "SSN_ENCRYPTION_KEY" "$SSN_ENCRYPTION_KEY" "production"
  add_env_var "SSN_ENCRYPTION_KEY" "$SSN_ENCRYPTION_KEY" "preview"
  add_env_var "SSN_ENCRYPTION_KEY" "$SSN_ENCRYPTION_KEY" "development"
  echo "✅ SSN_ENCRYPTION_KEY added"
  echo ""
fi

# Deploy to production
echo "🚀 Deploying to production..."
echo ""
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Next steps:"
echo "1. Visit your production URL (shown above)"
echo "2. Test form submission"
echo "3. Check Supabase Table Editor for the submitted data"
echo "4. Access admin dashboard at: https://gjhtechs.com/admin/login"
echo ""
echo "🔍 Monitor deployment status:"
echo "   vercel logs"
echo ""
