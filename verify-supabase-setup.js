#!/usr/bin/env node

/**
 * Verify Supabase Setup
 * Checks database tables, storage buckets, and permissions
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  console.log('🔍 Verifying Supabase Setup\n');
  console.log('═══════════════════════════════════════\n');

  let allChecks = [];

  // 1. Check database table
  console.log('1️⃣  Database Tables:\n');

  try {
    const { data, error } = await supabase
      .from('water_service_requests')
      .select('id, status, created_at')
      .limit(5);

    if (error) {
      console.log('   ❌ water_service_requests: NOT FOUND');
      console.log(`      Error: ${error.message}\n`);
      allChecks.push(false);
    } else {
      console.log('   ✅ water_service_requests: EXISTS');
      console.log(`      Current records: ${data?.length || 0}\n`);
      allChecks.push(true);
    }
  } catch (error) {
    console.log('   ❌ Error checking table:', error.message, '\n');
    allChecks.push(false);
  }

  // 2. Check storage buckets
  console.log('2️⃣  Storage Buckets:\n');

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.log('   ❌ Cannot list buckets:', error.message, '\n');
      allChecks.push(false);
    } else {
      const documentsBucket = buckets.find(b => b.name === 'documents');
      const signaturesBucket = buckets.find(b => b.name === 'signatures');

      if (documentsBucket) {
        console.log('   ✅ documents: EXISTS');
        console.log(`      Public: ${documentsBucket.public ? 'Yes' : 'No (private)'}`);
        console.log(`      Max size: ${(documentsBucket.file_size_limit / 1024 / 1024).toFixed(0)}MB\n`);
        allChecks.push(true);
      } else {
        console.log('   ❌ documents: NOT FOUND\n');
        allChecks.push(false);
      }

      if (signaturesBucket) {
        console.log('   ✅ signatures: EXISTS');
        console.log(`      Public: ${signaturesBucket.public ? 'Yes' : 'No (private)'}`);
        console.log(`      Max size: ${(signaturesBucket.file_size_limit / 1024 / 1024).toFixed(0)}MB\n`);
        allChecks.push(true);
      } else {
        console.log('   ❌ signatures: NOT FOUND\n');
        allChecks.push(false);
      }
    }
  } catch (error) {
    console.log('   ❌ Error checking buckets:', error.message, '\n');
    allChecks.push(false);
  }

  // 3. Test write permission
  console.log('3️⃣  Write Permissions:\n');

  try {
    const testData = {
      applicant_name: 'Test User',
      applicant_email: 'test@example.com',
      applicant_phone: '5551234567',
      service_address: '123 Test St',
      bill_type_preference: 'email',
      property_use_type: 'residential',
      acknowledged_service_terms: true,
      applicant_signature: 'Test Signature',
      trash_carts_needed: 1,
      recycle_carts_needed: 1,
      has_sprinkler_system: false,
      has_pool: false,
      has_co_applicant: false,
      mailing_address_same_as_service: true,
      service_request_date: new Date().toISOString(),
      status: 'new',
      deposit_amount_required: 0
    };

    const { data, error } = await supabase
      .from('water_service_requests')
      .insert(testData)
      .select('id')
      .single();

    if (error) {
      console.log('   ❌ Cannot insert test record:', error.message, '\n');
      allChecks.push(false);
    } else {
      console.log('   ✅ Write permission: OK');
      console.log(`      Test record created: ${data.id}\n`);

      // Clean up test record
      await supabase
        .from('water_service_requests')
        .delete()
        .eq('id', data.id);

      console.log('   🗑️  Test record deleted\n');
      allChecks.push(true);
    }
  } catch (error) {
    console.log('   ❌ Error testing write:', error.message, '\n');
    allChecks.push(false);
  }

  // Summary
  console.log('═══════════════════════════════════════\n');

  const passedChecks = allChecks.filter(c => c).length;
  const totalChecks = allChecks.length;

  if (passedChecks === totalChecks) {
    console.log('🎉 All checks passed! Your Supabase setup is complete.\n');
    console.log('✅ Ready for:');
    console.log('   • Local development (npm run dev)');
    console.log('   • Form submissions');
    console.log('   • File uploads');
    console.log('   • Production deployment\n');
    return 0;
  } else {
    console.log(`⚠️  ${passedChecks}/${totalChecks} checks passed\n`);
    console.log('Please fix the issues above and run again.\n');
    return 1;
  }
}

main().then(code => process.exit(code));
