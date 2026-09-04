"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/brand/gigs", label: "My gigs" },
  { href: "/brand/discover", label: "Discover" },
  { href: "/brand/messages", label: "Messages" },
  { href: "/brand/map", label: "Map" },
];

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col flex-1 max-w-md mx-auto w-full">
      <header
        className="flex items-center justify-between px-5 pt-6 pb-3"
        style={{ borderBottom: "1px solid var(--hairline)" }}
      >
        <span className="text-xl font-extrabold tracking-tight">Streetcast</span>
        <span
          className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full"
          style={{ background: "var(--fog)", color: "var(--graphite)" }}
        >
          Brand
        </span>
      </header>

      <div className="flex gap-1.5 px-5 pt-3.5">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 text-center text-xs font-semibold py-2 rounded-[10px]"
              style={
                active
                  ? { background: "var(--ink)", color: "#fff" }
                  : { background: "var(--fog)", color: "var(--graphite)" }
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <main className="flex flex-col flex-1 min-h-0">{children}</main>
    </div>
  );
}
