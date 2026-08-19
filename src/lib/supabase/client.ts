import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components ("use client").
 * Reads the public URL + anon key from env vars — see .env.local.example.
 *
 * NOTE: intentionally untyped (no <Database> generic) until you've
 * generated real types from your live schema — see README.md. Once you
 * have them: `createBrowserClient<Database>(...)`.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
