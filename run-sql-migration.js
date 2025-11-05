#!/usr/bin/env node

/**
 * Run SQL Migration via Supabase Management API
 * This uses the REST API to execute SQL directly
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    // Extract project ref from URL
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1];

    const options = {
      hostname: `${projectRef}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify({ sql }));
    req.end();
  });
}

async function main() {
  console.log('🚀 Running SQL Migration via Supabase API\n');

  // Read SQL file
  const sqlPath = path.join(__dirname, 'database', 'SAFE_RERUN_SCHEMA.sql');
  console.log('📖 Reading SQL file:', sqlPath);

  if (!fs.existsSync(sqlPath)) {
    console.error('❌ SQL file not found:', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log(`   ✅ Loaded (${sql.length} characters)\n`);

  console.log('📊 Executing SQL migration...\n');

  try {
    const result = await executeSql(sql);
    console.log('✅ Migration completed successfully!\n');
    console.log('═══════════════════════════════════════\n');
    console.log('🎉 Database schema is now up to date!\n');
    console.log('Next step: Run verification');
    console.log('   node verify-supabase-setup.js\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n═══════════════════════════════════════\n');
    console.log('ℹ️  The exec_sql RPC function might not be available.');
    console.log('Please run the migration manually:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/' + supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1]);
    console.log('2. Click: SQL Editor (left sidebar)');
    console.log('3. Click: New Query');
    console.log('4. Copy contents of: database/SAFE_RERUN_SCHEMA.sql');
    console.log('5. Paste and click Run\n');
    process.exit(1);
  }
}

main();
