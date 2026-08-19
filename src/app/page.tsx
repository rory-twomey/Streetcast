import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <div className="text-2xl font-extrabold tracking-tight mb-3">Streetcast</div>
      <h1 className="text-3xl font-bold tracking-tight max-w-md mb-3">
        Get cast. Get paid.
      </h1>
      <p className="max-w-sm mb-10" style={{ color: "var(--graphite)" }}>
        Streetcast matches brands with everyday people for local photoshoots, promo
        shifts, and content gigs — no agency, no follower count required.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/signup?role=talent"
          className="rounded-full px-6 py-3.5 font-semibold text-white text-center"
          style={{ background: "var(--blue)" }}
        >
          I want to get cast
        </Link>
        <Link
          href="/signup?role=brand"
          className="rounded-full px-6 py-3.5 font-semibold text-center border"
          style={{ borderColor: "var(--hairline)", color: "var(--ink)" }}
        >
          I&apos;m hiring talent
        </Link>
      </div>

      <Link href="/login" className="mt-8 text-sm" style={{ color: "var(--graphite)" }}>
        Already have an account? Log in
      </Link>
    </div>
  );
}
