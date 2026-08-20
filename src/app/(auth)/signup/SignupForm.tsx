"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = params.get("role") === "brand" ? "brand" : "talent";

  const [role, setRole] = useState<"talent" | "brand">(initialRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // 18+ check client-side too, for a fast error message —
    // the real enforcement is the `must_be_adult` check constraint in schema.sql.
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    if (new Date(dob) > eighteenYearsAgo) {
      setError("You must be 18 or older to use Streetcast.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    // Create the base profile row. RLS policy requires auth.uid() = id,
    // which holds here since the user is now signed in.
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      role,
      full_name: fullName,
      date_of_birth: dob,
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    if (role === "talent") {
      await supabase.from("talent_profiles").insert({ id: data.user.id });
      router.push("/talent/discover");
    } else {
      await supabase.from("brand_profiles").insert({
        id: data.user.id,
        company_name: companyName,
      });
      router.push("/brand/gigs");
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Create your account</h1>

        <div className="flex rounded-[10px] p-0.5" style={{ background: "rgba(118,118,128,.12)" }}>
          {(["talent", "brand"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className="flex-1 py-2 rounded-[8px] text-sm font-semibold"
              style={
                role === r
                  ? { background: "white", color: "var(--ink)" }
                  : { color: "var(--graphite)" }
              }
            >
              {r === "talent" ? "I'm talent" : "I'm a brand"}
            </button>
          ))}
        </div>

        <Field label="Full name">
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input"
          />
        </Field>

        {role === "brand" && (
          <Field label="Company name">
            <input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="input"
            />
          </Field>
        )}

        <Field label="Date of birth">
          <input
            required
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Email">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Password">
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </Field>

        {error && (
          <p className="text-sm" style={{ color: "var(--red)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full px-6 py-3.5 font-semibold text-white disabled:opacity-50"
          style={{ background: "var(--blue)" }}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p className="text-xs text-center mt-2" style={{ color: "var(--graphite)" }}>
          You&apos;ll be asked to verify your identity before you can book or apply
          for gigs — this keeps everyone on Streetcast real.
        </p>
      </form>

      <style jsx global>{`
        .input {
          border: 1px solid var(--hairline);
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 14px;
          width: 100%;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}
