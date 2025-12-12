import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client - requires SUPABASE_URL and SUPABASE_SERVICE_KEY in env
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  // Warning only; API routes will return errors if not configured
  console.warn("Supabase not configured (SUPABASE_URL or SUPABASE_SERVICE_KEY missing)");
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});
