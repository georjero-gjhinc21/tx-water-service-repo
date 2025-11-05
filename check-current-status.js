#!/usr/bin/env node

/**
 * Check Current Status of Application
 * Identifies what's working and what needs fixing
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log('🔍 TX Water Service - Current Status Check\n');
  console.log('═══════════════════════════════════════════════\n');

  let issues = [];
  let successes = [];

  // 1. Check environment
  console.log('1️⃣  Environment Variables:\n');
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log('   ✅ NEXT_PUBLIC_SUPABASE_URL');
    successes.push('Environment configured');
  } else {
    console.log('   ❌ NEXT_PUBLIC_SUPABASE_URL missing');
    issues.push('Missing environment variables');
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('   ✅ SUPABASE_SERVICE_ROLE_KEY');
  } else {
    console.log('   ❌ SUPABASE_SERVICE_ROLE_KEY missing');
    issues.push('Missing service role key');
  }
  console.log('');

  // 2. Check storage
  console.log('2️⃣  Storage Buckets:\n');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (!bucketsError) {
    const docs = buckets.find(b => b.name === 'documents');
    const sigs = buckets.find(b => b.name === 'signatures');

    if (docs) {
      console.log('   ✅ documents bucket exists');
      successes.push('Document storage ready');
    } else {
      console.log('   ❌ documents bucket missing');
      issues.push('Missing documents bucket');
    }

    if (sigs) {
      console.log('   ✅ signatures bucket exists');
      successes.push('Signature storage ready');
    } else {
      console.log('   ❌ signatures bucket missing');
      issues.push('Missing signatures bucket');
    }
  } else {
    console.log('   ❌ Cannot check buckets:', bucketsError.message);
    issues.push('Storage access error');
  }
  console.log('');

  // 3. Check table structure
  console.log('3️⃣  Database Table:\n');

  try {
    // Get table info using information_schema
    const { data: columns, error: colError } = await supabase
      .rpc('get_table_columns', { table_name: 'water_service_requests' })
      .catch(() => ({ data: null, error: { message: 'RPC not available' } }));

    // Fallback: try to select from table
    const { data: testData, error: testError } = await supabase
      .from('water_service_requests')
      .select('*')
      .limit(0);

    if (testError) {
      if (testError.message.includes('does not exist')) {
        console.log('   ❌ water_service_requests table DOES NOT EXIST');
        console.log('   📝 Action Required: Run database/SAFE_RERUN_SCHEMA.sql');
        issues.push('Table does not exist - SQL migration needed');
      } else if (testError.message.includes('Could not find')) {
        console.log('   ⚠️  Table exists but schema may be incomplete');
        console.log('   📝 Recommended: Run database/SAFE_RERUN_SCHEMA.sql to update');
        issues.push('Table schema incomplete - SQL migration recommended');
      } else {
        console.log('   ❌ Error checking table:', testError.message);
        issues.push('Table access error');
      }
    } else {
      console.log('   ✅ water_service_requests table exists');
      successes.push('Database table ready');
    }
  } catch (err) {
    console.log('   ❌ Unexpected error:', err.message);
    issues.push('Database connection error');
  }
  console.log('');

  // 4. Check RLS policies
  console.log('4️⃣  Row Level Security (RLS):\n');

  // Test anonymous insert capability
  const anonClient = createClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error: anonError } = await anonClient
    .from('water_service_requests')
    .select('id')
    .limit(1);

  if (anonError) {
    if (anonError.message.includes('Could not find')) {
      console.log('   ⚠️  Table needs schema update for RLS to work properly');
      issues.push('RLS policies need complete schema');
    } else {
      console.log('   ❌ Anonymous access error:', anonError.message);
      issues.push('RLS policy misconfigured');
    }
  } else {
    console.log('   ✅ Anonymous client can query table');
    console.log('   ℹ️  RLS policy check: Will test on actual insert');
    successes.push('Anonymous access configured');
  }
  console.log('');

  // Summary
  console.log('═══════════════════════════════════════════════\n');
  console.log('📊 Status Summary:\n');
  console.log(`   ✅ Successes: ${successes.length}`);
  console.log(`   ❌ Issues: ${issues.length}\n`);

  if (issues.length === 0) {
    console.log('🎉 Everything looks good!\n');
    console.log('✅ Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Test form submission at http://localhost:3000');
    console.log('   3. Deploy to production: ./deploy-to-vercel.sh\n');
    return 0;
  } else {
    console.log('⚠️  Issues Found:\n');
    issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
    console.log('');

    if (issues.some(i => i.includes('SQL migration'))) {
      console.log('🔧 PRIMARY ACTION REQUIRED:\n');
      console.log('   Run the database migration to create/update the schema:\n');
      console.log('   1. Open: https://supabase.com/dashboard/project/jsxoevmgtjrflwmsevsc/sql/new');
      console.log('   2. Copy all contents of: database/SAFE_RERUN_SCHEMA.sql');
      console.log('   3. Paste and click "Run"');
      console.log('   4. Re-run this script to verify: node check-current-status.js\n');
      console.log('   📖 See: OPEN_IN_SUPABASE.md for detailed instructions\n');
    }

    return 1;
  }
}

main().then(code => process.exit(code));
