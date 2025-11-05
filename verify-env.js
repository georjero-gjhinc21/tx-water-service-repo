#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * Checks that all required Supabase credentials are properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Environment Configuration...\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('   Please create it by copying .env.example\n');
  process.exit(1);
}

// Read .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const config = {};
envContent.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key) {
      config[key.trim()] = valueParts.join('=').trim();
    }
  }
});

// Required variables
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

let allGood = true;

// Check each required variable
required.forEach(varName => {
  const value = config[varName];

  if (!value || value.length === 0) {
    console.log(`❌ ${varName}: MISSING`);
    allGood = false;
  } else if (value.includes('your_') || value.includes('change-this')) {
    console.log(`❌ ${varName}: NOT CONFIGURED (still has placeholder)`);
    allGood = false;
  } else {
    console.log(`✅ ${varName}: Configured`);
    console.log(`   → ${value.substring(0, 40)}...`);
  }
});

console.log('');

// Verify the keys are different
if (config.NEXT_PUBLIC_SUPABASE_ANON_KEY && config.SUPABASE_SERVICE_ROLE_KEY) {
  if (config.NEXT_PUBLIC_SUPABASE_ANON_KEY === config.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('⚠️  WARNING: ANON_KEY and SERVICE_ROLE_KEY are IDENTICAL!');
    console.log('   This means you provided the anon key twice.');
    console.log('   The SERVICE_ROLE_KEY should be DIFFERENT.');
    console.log('   Get it from: Project Settings > API > service_role (click Reveal)\n');
    allGood = false;
  } else {
    console.log('✅ Keys are different (correct!)');

    // Try to decode JWT to verify role
    try {
      const serviceKey = config.SUPABASE_SERVICE_ROLE_KEY;
      const parts = serviceKey.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        if (payload.role === 'service_role') {
          console.log('✅ SERVICE_ROLE_KEY has correct role: service_role');
        } else if (payload.role === 'anon') {
          console.log('❌ SERVICE_ROLE_KEY has wrong role: anon (should be service_role)');
          allGood = false;
        }
      }
    } catch (e) {
      console.log('⚠️  Could not decode SERVICE_ROLE_KEY JWT');
    }
  }
}

console.log('');

// Final result
if (allGood) {
  console.log('🎉 All environment variables are properly configured!\n');
  console.log('Next steps:');
  console.log('1. Test locally: npm run dev');
  console.log('2. Add same variables to Vercel Dashboard');
  console.log('3. Redeploy production\n');
  process.exit(0);
} else {
  console.log('❌ Environment configuration issues found!\n');
  console.log('Please fix the issues above and run this script again.\n');
  console.log('Help:');
  console.log('- See QUICK_FIX_SUBMISSION_ERROR.md for fixing the service_role key');
  console.log('- See VERCEL_PRODUCTION_SETUP.md for production deployment\n');
  process.exit(1);
}
