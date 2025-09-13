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

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-black/10 glass-effect md:hidden safe-area-padding-bottom">
      <div className="grid grid-cols-5 max-w-screen-sm mx-auto">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center h-16 text-xs transition-all duration-[var(--duration-fast)] relative ${
                active ? "text-[var(--color-primary)]" : "text-foreground/70"
              } hover:text-[var(--color-primary)] active:scale-95`}
            >
              {active && (
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[var(--color-primary)] rounded-full" />
              )}
              <Icon className={`transition-transform duration-[var(--duration-fast)] ${active ? 'scale-110' : 'scale-100'} ${active ? 'size-6' : 'size-5'}`} />
              <span className={`mt-1 font-medium ${active ? 'text-[10px]' : 'text-[10px]'}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


