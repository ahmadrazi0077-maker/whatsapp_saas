import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://xsxtbztyqjmlwfnibtdm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseServiceKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY is not set. Some features may not work.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Test the connection
supabase.from('users').select('count', { count: 'exact', head: true })
  .then(({ error }) => {
    if (error) {
      console.error('❌ Supabase connection error:', error.message);
    } else {
      console.log('✅ Supabase connected successfully');
    }
  })
  .catch((err) => {
    console.error('❌ Supabase connection failed:', err.message);
  });
