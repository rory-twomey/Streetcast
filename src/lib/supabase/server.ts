import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Call this fresh each time — it reads the
 * current request's cookies to know who's logged in.
 *
 * NOTE: intentionally untyped (no <Database> generic) until you've
 * generated real types from your live schema — see README.md.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions (see middleware.ts).
          }
        },
      },
    }
  );
}
