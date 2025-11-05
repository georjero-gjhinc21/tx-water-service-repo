#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
  console.log('🔍 Quick Status Check\n');

  // Check if we can read the table
  console.log('1. Testing table access...');
  const { data, error } = await serviceClient
    .from('water_service_requests')
    .select('*')
    .limit(1);

  if (error) {
    console.log('   ❌ Error:', error.message);
    if (error.message.includes('Could not find')) {
      console.log('\n⚠️  DIAGNOSIS: Table exists but schema is incomplete\n');
      console.log('🔧 SOLUTION:');
      console.log('   1. Open: https://supabase.com/dashboard/project/jsxoevmgtjrflwmsevsc/sql/new');
      console.log('   2. Copy contents of: database/SAFE_RERUN_SCHEMA.sql');
      console.log('   3. Paste and Run\n');
    }
    return 1;
  }

  console.log('   ✅ Table accessible');
  console.log(`   Current records: ${data?.length || 0}\n`);

  // Check storage
  console.log('2. Testing storage buckets...');
  const { data: buckets } = await serviceClient.storage.listBuckets();
  const hasDocs = buckets?.some(b => b.name === 'documents');
  const hasSigs = buckets?.some(b => b.name === 'signatures');

  console.log(`   ${hasDocs ? '✅' : '❌'} documents bucket`);
  console.log(`   ${hasSigs ? '✅' : '❌'} signatures bucket\n`);

  // Check anon access
  console.log('3. Testing anonymous (public) access...');
  const { error: anonError } = await anonClient
    .from('water_service_requests')
    .select('id')
    .limit(1);

  if (anonError) {
    console.log('   ❌ Error:', anonError.message);
  } else {
    console.log('   ✅ Anonymous client can query table\n');
  }

  console.log('═══════════════════════════════════════\n');

  if (!error && hasDocs && hasSigs && !anonError) {
    console.log('🎉 All systems ready!\n');
    console.log('Next: npm run dev (test locally)\n');
    return 0;
  } else {
    console.log('⚠️  Setup incomplete - see errors above\n');
    return 1;
  }
}

main().then(code => process.exit(code));
