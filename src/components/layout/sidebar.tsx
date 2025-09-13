"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Target, BarChart3, Calendar, Settings } from "lucide-react";

const items = [
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/campaigns", label: "Kampanjer", icon: Target },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/calendar", label: "Kalender", icon: Calendar },
  { href: "/settings", label: "Innstillinger", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:block w-60 border-r border-black/10 h-[calc(100vh-56px)] sticky top-14">
      <nav className="p-3 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${
                active
                  ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                  : "hover:bg-black/5 text-foreground/80"
              }`}
            >
              <Icon className="size-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}


