#!/usr/bin/env node

/**
 * Complete Supabase Setup Script
 * Runs database migration and creates storage buckets
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log('🚀 Starting Supabase Setup...\n');

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runDatabaseMigration() {
  console.log('📊 Running database migration...');

  try {
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'database', 'SAFE_RERUN_SCHEMA.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`   Found ${statements.length} SQL statements`);

    // Execute each statement using the REST API
    // Note: This is a workaround since supabase-js doesn't support raw SQL execution
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      // If exec_sql RPC doesn't exist, we need to use the Management API
      console.log('   ⚠️  Direct SQL execution not available via client');
      console.log('   📝 Attempting alternative method...\n');

      // Try to create tables using the Supabase client methods
      return await createTablesManually();
    }

    console.log('✅ Database migration completed successfully!\n');
    return true;

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    return false;
  }
}

async function createTablesManually() {
  console.log('📋 Creating tables manually using REST API...');

  try {
    // Check if table already exists
    const { data: existingTables, error: checkError } = await supabase
      .from('water_service_requests')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('✅ Table "water_service_requests" already exists');
      return true;
    }

    console.log('   ⚠️  Table needs to be created');
    console.log('   📖 Please run database/SAFE_RERUN_SCHEMA.sql in Supabase SQL Editor\n');
    return false;

  } catch (error) {
    console.log('   ⚠️  Cannot verify table existence');
    console.log('   📖 Please run database/SAFE_RERUN_SCHEMA.sql in Supabase SQL Editor\n');
    return false;
  }
}

async function createStorageBuckets() {
  console.log('🗄️  Setting up storage buckets...\n');

  const buckets = [
    {
      name: 'documents',
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    },
    {
      name: 'signatures',
      public: false,
      fileSizeLimit: 2097152, // 2MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg']
    }
  ];

  let allSuccess = true;

  for (const bucket of buckets) {
    console.log(`   Creating bucket: ${bucket.name}`);

    // Check if bucket exists
    const { data: existingBuckets } = await supabase.storage.listBuckets();
    const exists = existingBuckets?.some(b => b.name === bucket.name);

    if (exists) {
      console.log(`   ✅ Bucket "${bucket.name}" already exists`);
      continue;
    }

    // Create bucket
    const { data, error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit,
      allowedMimeTypes: bucket.allowedMimeTypes
    });

    if (error) {
      console.log(`   ❌ Failed to create "${bucket.name}": ${error.message}`);
      allSuccess = false;
    } else {
      console.log(`   ✅ Created bucket: ${bucket.name}`);
    }
  }

  console.log('');
  return allSuccess;
}

async function verifySetup() {
  console.log('🔍 Verifying setup...\n');

  let allGood = true;

  // Check table exists
  try {
    const { error } = await supabase
      .from('water_service_requests')
      .select('id')
      .limit(1);

    if (error) {
      console.log('   ❌ Table "water_service_requests" not found');
      console.log('      → Run database/SAFE_RERUN_SCHEMA.sql in Supabase SQL Editor');
      allGood = false;
    } else {
      console.log('   ✅ Table "water_service_requests" exists');
    }
  } catch (error) {
    console.log('   ❌ Cannot verify table:', error.message);
    allGood = false;
  }

  // Check storage buckets
  const { data: buckets } = await supabase.storage.listBuckets();

  if (buckets?.some(b => b.name === 'documents')) {
    console.log('   ✅ Storage bucket "documents" exists');
  } else {
    console.log('   ❌ Storage bucket "documents" not found');
    allGood = false;
  }

  if (buckets?.some(b => b.name === 'signatures')) {
    console.log('   ✅ Storage bucket "signatures" exists');
  } else {
    console.log('   ❌ Storage bucket "signatures" not found');
    allGood = false;
  }

  console.log('');
  return allGood;
}

async function main() {
  console.log('🔗 Connecting to Supabase...');
  console.log(`   URL: ${supabaseUrl}\n`);

  // Test connection by checking storage (always available)
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('❌ Connection failed:', error.message || 'Unknown error');
      process.exit(1);
    }
    console.log('✅ Connected to Supabase\n');
  } catch (error) {
    console.error('❌ Connection failed:', error?.message || error);
    process.exit(1);
  }

  // Run setup steps
  const migrationSuccess = await runDatabaseMigration();
  const bucketsSuccess = await createStorageBuckets();
  const verifySuccess = await verifySetup();

  // Summary
  console.log('═══════════════════════════════════════');

  if (verifySuccess) {
    console.log('🎉 Supabase setup completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Test form submission locally: npm run dev');
    console.log('2. Deploy to production: ./deploy-to-vercel.sh');
    console.log('');
  } else {
    console.log('⚠️  Setup partially complete');
    console.log('');
    console.log('Manual steps required:');
    console.log('1. Go to: https://supabase.com/dashboard/project/jsxoevmgtjrflwmsevsc');
    console.log('2. SQL Editor → New Query');
    console.log('3. Copy contents of database/SAFE_RERUN_SCHEMA.sql');
    console.log('4. Paste and run');
    console.log('5. Re-run this script to verify: node setup-supabase-complete.js');
    console.log('');
  }

  process.exit(verifySuccess ? 0 : 1);
}

main().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
