// This file is kept for future Supabase integration
// Currently using in-memory storage through Express API

export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

// Future: Initialize Supabase client here when needed
// import { createClient } from '@supabase/supabase-js'
// export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey)
