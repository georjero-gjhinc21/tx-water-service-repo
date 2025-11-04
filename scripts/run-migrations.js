#!/usr/bin/env node
// scripts/run-migrations.js
// Database migration runner

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  try {
    // Read the main schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Executing schema.sql...');
    
    // Execute the schema
    // Note: Supabase JS client doesn't directly execute raw SQL
    // You'll need to run this via Supabase Dashboard SQL Editor or psql
    
    console.log('\n⚠️  MANUAL STEP REQUIRED:');
    console.log('='.repeat(50));
    console.log('Please run the schema file manually:');
    console.log('');
    console.log('Option 1: Via Supabase Dashboard');
    console.log('  1. Go to https://supabase.com/dashboard');
    console.log('  2. Select your project');
    console.log('  3. Go to SQL Editor');
    console.log('  4. Copy contents from: database/schema.sql');
    console.log('  5. Run the SQL');
    console.log('');
    console.log('Option 2: Via psql');
    console.log('  psql -h <your-db-host> -U postgres -d postgres -f database/schema.sql');
    console.log('='.repeat(50));
    console.log('');

    // Check if tables exist
    console.log('🔍 Checking if tables exist...');
    
    const { data, error } = await supabase
      .from('water_service_requests')
      .select('count')
      .limit(1);

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('❌ Table water_service_requests does not exist');
        console.log('   Please run the schema file as instructed above');
      } else {
        console.error('❌ Error:', error.message);
      }
    } else {
      console.log('✅ Table water_service_requests exists!');
      console.log('✅ Database is ready');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
