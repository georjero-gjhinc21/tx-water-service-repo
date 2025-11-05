#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read credentials
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

console.log('🔌 Connecting to Supabase Storage API...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorageBuckets() {
  try {
    console.log('📦 Creating storage buckets...\n');

    // Create documents bucket
    console.log('1️⃣  Creating "documents" bucket...');
    const { data: docBucket, error: docError } = await supabase
      .storage
      .createBucket('documents', {
        public: false,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/heic']
      });

    if (docError) {
      if (docError.message.includes('already exists')) {
        console.log('   ✅ Documents bucket already exists\n');
      } else {
        console.log('   ❌ Error:', docError.message, '\n');
      }
    } else {
      console.log('   ✅ Documents bucket created successfully!\n');
    }

    // Create signatures bucket
    console.log('2️⃣  Creating "signatures" bucket...');
    const { data: sigBucket, error: sigError } = await supabase
      .storage
      .createBucket('signatures', {
        public: false,
        fileSizeLimit: 2097152, // 2MB
        allowedMimeTypes: ['image/png', 'image/jpeg']
      });

    if (sigError) {
      if (sigError.message.includes('already exists')) {
        console.log('   ✅ Signatures bucket already exists\n');
      } else {
        console.log('   ❌ Error:', sigError.message, '\n');
      }
    } else {
      console.log('   ✅ Signatures bucket created successfully!\n');
    }

    // List all buckets to verify
    console.log('📋 Verifying buckets...');
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();

    if (listError) {
      console.log('   ❌ Could not list buckets:', listError.message);
    } else {
      console.log('   ✅ Available buckets:');
      buckets.forEach(bucket => {
        console.log(`      - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      });
    }

    console.log('\n✅ Storage buckets setup complete!\n');
    return true;

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    return false;
  }
}

setupStorageBuckets().then(success => {
  process.exit(success ? 0 : 1);
});
