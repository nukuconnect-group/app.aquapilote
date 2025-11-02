// Custom Supabase client configuration to avoid LockManager issues
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hhsvraqchtqqgaezhnzn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoc3ZyYXFjaHRxcWdhZXpobnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMTQ0OTUsImV4cCI6MjA3NzY5MDQ5NX0.yPX0oLUaW5L2_d43MB7X8xpwPaTGCMDNsWKx9JbGrbA";

// Export the configured supabase client with LockManager disabled
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});
