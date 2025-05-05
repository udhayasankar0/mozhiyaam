
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cawfmtntijvtiemplmff.supabase.co";
 const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhd2ZtdG50aWp2dGllbXBsbWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MDcyODQsImV4cCI6MjA1OTE4MzI4NH0.jhPoSziLG0WBQnVwBmdvVanHyccc6l0BkRyIDa17-ac";


const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});

export default supabase;
