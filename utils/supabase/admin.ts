// Service-role Supabase client for the very small number of operations
// that need to bypass RLS — currently just account deletion (we have to
// remove the auth.users row, which RLS-bound clients can't touch).
//
// Requires SUPABASE_SERVICE_ROLE_KEY in env. Set in Vercel → Project →
// Settings → Environment Variables. Never expose this key to the client;
// only call this function from server-side route handlers.
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env var. " +
      "Set SUPABASE_SERVICE_ROLE_KEY in Vercel + .env.local before using the admin client."
    );
  }
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
