import { createClient } from '@supabase/supabase-js';
import { createMockClient } from './mockSupabase.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use the real Supabase client only when valid-looking credentials are present.
// Otherwise fall back to a localStorage-backed mock so the app runs with no backend.
const hasRealCreds =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  !String(supabaseUrl).includes('your-project') &&
  !String(supabaseAnonKey).includes('your-anon-key');

const isProd = import.meta.env.PROD;

// In production, never fall back to the dev-only mock — it stores data in each
// visitor's own browser and isn't shared between users. Require real Supabase
// credentials so a production build fails loudly instead of shipping a broken app.
if (isProd && !hasRealCreds) {
  throw new Error(
    'Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for production builds.'
  );
}

export const supabase = hasRealCreds
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

if (!hasRealCreds && !isProd) {
  console.info(
    '[goblin] Using mock Supabase (localStorage). Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for a real backend.'
  );
}
