import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          role: 'admin' | 'manager' | 'viewer'
          created_at: string
          updated_at: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          email: string | null
          company: string | null
          industry: string | null
          logo_url: string | null
          brand_color: string
          primary_contact_name: string | null
          primary_contact_email: string | null
          phone: string | null
          address: string | null
          status: 'active' | 'paused' | 'completed'
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
