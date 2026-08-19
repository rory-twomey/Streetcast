/**
 * PLACEHOLDER TYPES.
 *
 * Once you've run supabase/schema.sql against your real Supabase project,
 * generate the real types with the Supabase CLI:
 *
 *   npx supabase gen types typescript --project-id <your-project-id> > src/types/database.types.ts
 *
 * Until then, this permissive type keeps the Supabase client's generics
 * happy without blocking development. Swap it out as soon as you have a
 * live project — the real generated types will catch typos in table/column
 * names at compile time, which this placeholder deliberately does not.
 */
export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: unknown[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
