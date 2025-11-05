#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read credentials from .env.supabase
const envPath = path.join(__dirname, '.env.supabase');
const envContent = fs.readFileSync(envPath, 'utf8');

const config = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    config[key.trim()] = value.trim();
  }
});

const supabaseUrl = config.SUPABASE_URL;
const supabaseKey = config.SUPABASE_SERVICE_ROLE_KEY || config.SUPABASE_ANON_KEY;

console.log('🔌 Connecting to Supabase...');
console.log('   URL:', supabaseUrl);
console.log('   Key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('\n📊 Step 1: Testing connection...');

    // Test connection by querying pg_tables
    const { data: tables, error: testError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .limit(1);

    if (testError) {
      console.log('⚠️  Warning:', testError.message);
      console.log('   Attempting to proceed with migration...\n');
    } else {
      console.log('✅ Connection successful!\n');
    }

    console.log('📜 Step 2: Reading SQL migration file...');
    const sqlPath = path.join(__dirname, 'database', 'SAFE_RERUN_SCHEMA.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log(`   Read ${sql.length} characters from SAFE_RERUN_SCHEMA.sql\n`);

    console.log('🚀 Step 3: Executing database migration...');
    console.log('   This may take 30-60 seconds...\n');

    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      // RPC might not exist, try alternative method
      console.log('⚠️  exec_sql RPC not available, using direct query...\n');

      const { error: queryError } = await supabase.from('_').select('*').limit(0);
      console.log('❌ Cannot execute raw SQL via Supabase JS client.');
      console.log('   The service role key provided may not have sufficient permissions.\n');
      console.log('📋 MANUAL STEPS REQUIRED:');
      console.log('   1. Go to https://supabase.com/dashboard');
      console.log('   2. Select your project: jsxoevmgtjrflwmsevsc');
      console.log('   3. Navigate to SQL Editor');
      console.log('   4. Copy contents of: database/SAFE_RERUN_SCHEMA.sql');
      console.log('   5. Paste and click "Run"\n');
      return false;
    }

    console.log('✅ Database migration completed!\n');

    console.log('📦 Step 4: Creating storage buckets...');

    // Create documents bucket
    const { data: docBucket, error: docError } = await supabase
      .storage
      .createBucket('documents', {
        public: false,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/heic']
      });

    if (docError && !docError.message.includes('already exists')) {
      console.log('⚠️  Documents bucket:', docError.message);
    } else {
      console.log('✅ Documents bucket created (or already exists)');
    }

    // Create signatures bucket
    const { data: sigBucket, error: sigError } = await supabase
      .storage
      .createBucket('signatures', {
        public: false,
        fileSizeLimit: 2097152, // 2MB
        allowedMimeTypes: ['image/png', 'image/jpeg']
      });

    if (sigError && !sigError.message.includes('already exists')) {
      console.log('⚠️  Signatures bucket:', sigError.message);
    } else {
      console.log('✅ Signatures bucket created (or already exists)\n');
    }

    console.log('🧪 Step 5: Verifying setup...');

    // Try to query the water_service_requests table
    const { data: requests, error: queryError } = await supabase
      .from('water_service_requests')
      .select('id')
      .limit(1);

    if (queryError) {
      console.log('⚠️  Cannot query water_service_requests:', queryError.message);
      console.log('   Table may not exist yet. Please run the SQL manually.\n');
      return false;
    }

    console.log('✅ Table water_service_requests is accessible!');
    console.log(`   Current records: ${requests?.length || 0}\n`);

    console.log('✨ Step 6: Inserting test record...');

    const { data: testRecord, error: insertError } = await supabase
      .from('water_service_requests')
      .insert({
        applicant_name: 'Test User (Automated Setup)',
        applicant_email: 'test@example.com',
        applicant_phone: '5551234567',
        service_address: '123 Test Street',
        property_use_type: 'owner_occupied',
        bill_type_preference: 'email',
        metadata: {
          setup_automated: true,
          setup_timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (insertError) {
      console.log('⚠️  Test insert failed:', insertError.message);
    } else {
      console.log('✅ Test record created!');
      console.log(`   ID: ${testRecord.id}`);
      console.log(`   Status: ${testRecord.status}\n`);
    }

    console.log('🎉 DATABASE SETUP COMPLETE!\n');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📋 Next Steps:\n');
    console.log('1. Create .env.local file with these values:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL=' + supabaseUrl);
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=' + config.SUPABASE_ANON_KEY);
    console.log('   SUPABASE_SERVICE_ROLE_KEY=' + supabaseKey);
    console.log('\n2. Add same variables to Vercel Dashboard\n');
    console.log('3. Test locally: npm run dev\n');
    console.log('4. Deploy: git push origin master\n');
    console.log('═══════════════════════════════════════════════════════\n');

    return true;

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    console.error(err);
    return false;
  }
}

// Run setup
setupDatabase().then(success => {
  process.exit(success ? 0 : 1);
});
