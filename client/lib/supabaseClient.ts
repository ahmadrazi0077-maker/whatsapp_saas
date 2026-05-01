import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xsxtbztyqjmlwfnibtdm.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_e-Q5WGbgtfRRuQJr3NO6gw_972Ok9Jy'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
