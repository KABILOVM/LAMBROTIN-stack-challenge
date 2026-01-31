import { createClient } from '@supabase/supabase-js';

// Credentials provided by user
// Fallbacks ensure the app works on Vercel immediately without manual Env Var configuration
// Use optional chaining (import.meta.env?.) to prevent runtime crash if env is undefined
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://tnvzqiolsxjypejufjfa.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRudnpxaW9sc3hqeXBlanVmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3OTEyNTUsImV4cCI6MjA4NDM2NzI1NX0.tPbhsaDRqn3KIdGTzdAopxrwCag9wHav9vaSqzouk-Y';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials missing! Using defaults/fallbacks.');
}

export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey
);