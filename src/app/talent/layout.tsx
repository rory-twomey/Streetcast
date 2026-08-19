import Link from "next/link";
import { Compass, Calendar, MessageCircle, User } from "lucide-react";

const navItems = [
  { href: "/talent/discover", label: "Discover", icon: Compass },
  { href: "/talent/bookings", label: "Bookings", icon: Calendar },
  { href: "/talent/messages", label: "Messages", icon: MessageCircle },
  { href: "/talent/profile", label: "Profile", icon: User },
];

export default function TalentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1 max-w-md mx-auto w-full">
      <header
        className="flex items-center justify-between px-5 pt-6 pb-3"
        style={{ borderBottom: "1px solid var(--hairline)" }}
      >
        <span className="text-xl font-extrabold tracking-tight">Streetcast</span>
      </header>

      <main className="flex flex-col flex-1 min-h-0">{children}</main>

      <nav
        className="flex bg-white/85 backdrop-blur-xl"
        style={{ borderTop: "0.5px solid var(--hairline)" }}
      >
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center gap-1 pt-2.5 pb-3.5 text-[9.5px] font-semibold"
            style={{ color: "var(--graphite)" }}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
