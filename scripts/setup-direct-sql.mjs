import pkg from 'pg';
const { Client } = pkg;
import { readFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.SUPABASE_PROJECT_URL || 'https://oucpashabmqeninqghhv.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Extract project ID from URL
const projectId = supabaseUrl.match(/\/\/([^.]+)\./)?.[1];

console.log('🔧 Phase 3: Direct SQL Setup\n');
console.log('📡 Connecting to Supabase Postgres...');

const client = new Client({
  host: `db.${projectId}.supabase.co`,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: serviceKey,
  ssl: { rejectUnauthorized: false }
});

async function runSetup() {
  try {
    await client.connect();
    console.log('✅ Connected!\n');

    const sqlPath = `${__dirname}/../supabase/migrations/20260220_create_brand_assets.sql`;
    const sql = readFileSync(sqlPath, 'utf-8');

    console.log('📝 Executing SQL migration...');
    await client.query(sql);
    console.log('✅ Migration completed successfully\n');

    // Verify brands
    console.log('🔍 Verifying...');
    const { rows } = await client.query('SELECT * FROM brands;');
    
    if (rows.length > 0) {
      console.log(`✅ Setup verified! Found ${rows.length} default brands:`);
      rows.forEach(b => console.log(`   • ${b.name} (${b.slug})`));
    } else {
      console.log('⚠️  No brands found');
    }

    console.log('\n✅ Phase 3 Database Setup Complete!\n');

    await client.end();

  } catch (err) {
    console.error('❌ Error:', err.message);
    await client.end().catch(() => {});
    process.exit(1);
  }
}

runSetup();
