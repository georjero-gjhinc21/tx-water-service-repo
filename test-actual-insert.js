#!/usr/bin/env node

/**
 * Test Actual Form Submission
 * Simulates the real server action to identify any RLS or permission issues
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🧪 Testing Actual Form Submission Flow\n');
console.log('═══════════════════════════════════════════════\n');

// This simulates what the server action does
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testInsert() {
  console.log('1️⃣  Preparing test data...\n');

  const testData = {
    // Required fields from the form
    applicant_name: 'Test User',
    applicant_email: 'test@example.com',
    applicant_phone: '5551234567',
    service_address: '123 Test Street',
    bill_type_preference: 'email',
    property_use_type: 'residential',
    trash_carts_needed: 1,
    recycle_carts_needed: 1,
    has_sprinkler_system: false,
    has_pool: false,
    has_co_applicant: false,
    mailing_address_same_as_service: true,
    acknowledged_service_terms: true,
    applicant_signature: 'Test Signature',
    service_request_date: new Date().toISOString(),
    status: 'new',
    deposit_amount_required: 0,
    metadata: {
      test: true,
      source: 'test-script'
    }
  };

  console.log('   Test applicant:', testData.applicant_name);
  console.log('   Test email:', testData.applicant_email);
  console.log('   Using service_role key:', serviceRoleKey.substring(0, 20) + '...\n');

  console.log('2️⃣  Attempting INSERT...\n');

  const { data, error } = await supabase
    .from('water_service_requests')
    .insert(testData)
    .select('id, applicant_name, status, created_at')
    .single();

  if (error) {
    console.log('   ❌ INSERT FAILED\n');
    console.log('   Error Code:', error.code);
    console.log('   Error Message:', error.message);
    console.log('   Error Details:', error.details || 'None');
    console.log('   Error Hint:', error.hint || 'None\n');

    if (error.code === '42501') {
      console.log('🔍 DIAGNOSIS: Row-Level Security (RLS) Policy Violation\n');
      console.log('   This means the database table exists, but the RLS policy');
      console.log('   is blocking the INSERT operation.\n');
      console.log('🔧 FIX REQUIRED:\n');
      console.log('   Run the complete database schema to set up RLS policies:');
      console.log('   1. Open: https://supabase.com/dashboard/project/jsxoevmgtjrflwmsevsc/sql/new');
      console.log('   2. Copy contents of: database/SAFE_RERUN_SCHEMA.sql');
      console.log('   3. Paste and click "Run"\n');
      console.log('   The SQL creates this policy:');
      console.log('   CREATE POLICY "Service role bypass RLS"');
      console.log('   ON water_service_requests');
      console.log('   FOR ALL TO service_role');
      console.log('   USING (true) WITH CHECK (true);\n');
      return false;
    }

    if (error.message.includes('Could not find')) {
      console.log('🔍 DIAGNOSIS: Table Schema Incomplete\n');
      console.log('   The table exists but is missing required columns.\n');
      console.log('🔧 FIX REQUIRED:\n');
      console.log('   Run database/SAFE_RERUN_SCHEMA.sql in Supabase SQL Editor\n');
      return false;
    }

    console.log('🔍 DIAGNOSIS: Unknown Error\n');
    console.log('   Please review the error details above.\n');
    return false;
  }

  console.log('   ✅ INSERT SUCCESSFUL!\n');
  console.log('   Record ID:', data.id);
  console.log('   Applicant:', data.applicant_name);
  console.log('   Status:', data.status);
  console.log('   Created:', data.created_at, '\n');

  console.log('3️⃣  Cleaning up (deleting test record)...\n');

  const { error: deleteError } = await supabase
    .from('water_service_requests')
    .delete()
    .eq('id', data.id);

  if (deleteError) {
    console.log('   ⚠️  Could not delete test record:', deleteError.message);
    console.log('   You can manually delete it from Supabase Table Editor\n');
  } else {
    console.log('   ✅ Test record deleted\n');
  }

  return true;
}

async function testStorageUpload() {
  console.log('4️⃣  Testing storage bucket upload...\n');

  // Create a fake file buffer
  const testFile = Buffer.from('Test document content');

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(`test/${Date.now()}-test.txt`, testFile, {
      contentType: 'text/plain'
    });

  if (error) {
    console.log('   ❌ STORAGE UPLOAD FAILED\n');
    console.log('   Error:', error.message);

    if (error.message.includes('row-level security') || error.statusCode === '403') {
      console.log('\n🔍 DIAGNOSIS: Storage Bucket RLS Issue\n');
      console.log('   The storage bucket exists but RLS policies block uploads.\n');
      console.log('🔧 FIX REQUIRED:\n');
      console.log('   1. Go to: https://supabase.com/dashboard/project/jsxoevmgtjrflwmsevsc/storage/buckets');
      console.log('   2. Click on "documents" bucket');
      console.log('   3. Go to "Policies" tab');
      console.log('   4. Add policy: Allow service_role to INSERT/UPDATE/SELECT\n');
      return false;
    }

    return false;
  }

  console.log('   ✅ STORAGE UPLOAD SUCCESSFUL!\n');
  console.log('   Path:', data.path, '\n');

  // Clean up
  await supabase.storage.from('documents').remove([data.path]);
  console.log('   ✅ Test file deleted\n');

  return true;
}

async function main() {
  try {
    const insertSuccess = await testInsert();
    const storageSuccess = await testStorageUpload();

    console.log('═══════════════════════════════════════════════\n');
    console.log('📊 Test Results:\n');
    console.log(`   Database INSERT: ${insertSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Storage UPLOAD:  ${storageSuccess ? '✅ PASS' : '❌ FAIL'}\n`);

    if (insertSuccess && storageSuccess) {
      console.log('🎉 All tests passed! Your form should work.\n');
      console.log('✅ Ready for:');
      console.log('   • Local testing: npm run dev');
      console.log('   • Production deployment: ./deploy-to-vercel.sh\n');
      return 0;
    } else {
      console.log('⚠️  Some tests failed. Please fix the issues above.\n');
      return 1;
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return 1;
  }
}

main().then(code => process.exit(code));
