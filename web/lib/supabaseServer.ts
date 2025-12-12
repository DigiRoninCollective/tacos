import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabaseServer: SupabaseClient | undefined;

export function getSupabaseServer(): SupabaseClient {
  if (!_supabaseServer) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
      throw new Error("Missing or invalid Supabase URL env var (SUPABASE_URL). Ensure it includes https://your-project-ref.supabase.co");
    }
    if (!supabaseServiceKey) {
      throw new Error("Missing Supabase Service Key env var (SUPABASE_SERVICE_KEY).");
    }

    _supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });
  }
  return _supabaseServer;
}
