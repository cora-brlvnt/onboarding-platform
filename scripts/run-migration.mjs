import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Phase 3: Brand Assets Manager — Supabase Setup\n');

if (!supabaseUrl) {
  console.error('❌ Missing SUPABASE_PROJECT_URL');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not in environment');
  console.log('\nℹ️  To get your service role key:');
  console.log('1. Go to: https://app.supabase.com');
  console.log('2. Select project (oucpashabmqeninqghhv)');
  console.log('3. Settings → API');
  console.log('4. Copy the "service_role" secret key');
  console.log('5. Set: export SUPABASE_SERVICE_ROLE_KEY="your-key"');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    const sqlPath = `${__dirname}/../supabase/migrations/20260220_create_brand_assets.sql`;
    const sql = readFileSync(sqlPath, 'utf-8');

    console.log('📝 Running SQL migration...');
    
    try {
      const { error } = await supabase.rpc('execute_sql', {
        sql: sql
      });

      if (error && error.code === 'PGRST204') {
        console.log('✅ Migration executed (no rows returned)');
      } else if (error) {
        throw error;
      } else {
        console.log('✅ Migration completed successfully');
      }
    } catch (rpcError) {
      console.log('ℹ️  RPC method not available, verifying direct setup...');
    }

    // Verify by listing brands
    console.log('\n🔍 Verifying setup...');
    const { data: brands, error: verifyError } = await supabase
      .from('brands')
      .select('*');

    if (verifyError && verifyError.code === 'PGRST116') {
      console.log('ℹ️  Tables not yet created. Please run SQL migration manually.');
      console.log('\n📋 SQL to run:');
      console.log(sql.substring(0, 200) + '...');
      return;
    } else if (verifyError) {
      throw verifyError;
    } else if (brands && brands.length > 0) {
      console.log(`✅ Setup verified! Found ${brands.length} default brands:`);
      brands.forEach(b => console.log(`   ✓ ${b.name} (${b.slug})`));
    } else {
      console.log('ℹ️  Brands table exists (no data yet)');
    }

    console.log('\n✅ Phase 3 Supabase setup complete!\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

runMigration();
