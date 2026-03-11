import { createClient } from "@supabase/supabase-js";

export function supabaseService() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables. Check your .env.local file.");
  }

  return createClient(supabaseUrl, supabaseKey);
}
