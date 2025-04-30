
import { createClient } from '@supabase/supabase-js';

// Use the actual project URL and anonymous key
const supabaseUrl = 'https://cawfmtntijvtiemplmff.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhd2ZtdG50aWp2dGllbXBsbWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MDcyODQsImV4cCI6MjA1OTE4MzI4NH0.jhPoSziLG0WBQnVwBmdvVanHyccc6l0BkRyIDa17-ac';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});

export default supabase;
