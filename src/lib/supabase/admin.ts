import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Admin client for privileged, server-only operations — e.g. the Stripe
 * webhook, which has no logged-in user session to work with, so it can't
 * use the normal request-scoped client. This bypasses row-level security
 * entirely, so never import this into anything that runs in the browser.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
