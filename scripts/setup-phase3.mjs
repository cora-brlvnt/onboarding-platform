import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_PROJECT_URL || 'https://oucpashabmqeninqghhv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.log('Please set: export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 Phase 3: Setting up Brand Assets Manager\n');

async function setupDatabase() {
  try {
    // Test connection
    console.log('📡 Testing Supabase connection...');
    const { data, error } = await supabase.from('users').select('count(*)').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.log('✅ Connected to Supabase\n');
    }

    // Insert default brands (table might already exist from manual SQL)
    console.log('📝 Setting up default brands...');
    
    const { error: insertError } = await supabase
      .from('brands')
      .insert([
        { 
          name: 'Berelvant', 
          slug: 'berelvant', 
          description: 'AI automation and growth systems'
        },
        { 
          name: 'CVRedi', 
          slug: 'cvredi', 
          description: 'Conversion rate optimization tools'
        },
        { 
          name: 'FastTrack Hub', 
          slug: 'fasttrack-hub', 
          description: 'Community and mentorship platform'
        }
      ])
      .select();

    if (insertError && insertError.code === 'PGRST116') {
      console.log('ℹ️  Tables not yet created. Run SQL migration first:');
      console.log('   1. Go to: https://app.supabase.com/project/oucpashabmqeninqghhv/sql/new');
      console.log('   2. Copy: supabase/migrations/20260220_create_brand_assets.sql');
      console.log('   3. Click: Run\n');
      process.exit(1);
    } else if (insertError && insertError.code === '23505') {
      console.log('✅ Default brands already exist\n');
    } else if (insertError) {
      throw insertError;
    } else {
      console.log('✅ Default brands created\n');
    }

    // Verify brands
    console.log('🔍 Verifying setup...');
    const { data: brands, error: verifyError } = await supabase
      .from('brands')
      .select('*');

    if (verifyError) {
      throw verifyError;
    }

    if (brands && brands.length > 0) {
      console.log(`✅ Found ${brands.length} brands:`);
      brands.forEach(b => console.log(`   • ${b.name} (${b.slug})`));
    }

    console.log('\n✅ Phase 3 Database Setup Complete!\n');
    console.log('📋 Next steps:');
    console.log('   1. Create "brand-assets" storage bucket in Supabase');
    console.log('      → https://app.supabase.com/project/oucpashabmqeninqghhv/storage/buckets');
    console.log('   2. Make bucket PUBLIC');
    console.log('   3. Deploy to Railway: git push origin main');
    console.log('   4. Test at: https://berelvant-onboarding-platform-production.up.railway.app/brand-assets\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

setupDatabase();
