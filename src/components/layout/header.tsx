"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, User2 } from "lucide-react";
import { useRole } from "@/src/providers/role-provider";
import { UserRole } from "@/src/types/core";
import { useTheme } from "@/src/providers/theme-provider";
import { useAuth } from "@/src/providers/auth-provider";
import { Button } from "@/src/components/ui/button";

export function Header() {
  const { role, setRole } = useRole();
  const { theme, toggle } = useTheme();
  const { profile, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/10 glass-effect">
      <div className="mx-auto max-w-screen-lg px-4 h-16 flex items-center justify-between">
        <Link href="/leads" className="font-semibold text-lg flex items-center gap-2 transition-transform duration-[var(--duration-fast)] hover:scale-105 active:scale-95">
          <Image src="/logo.svg" alt="Luna" width={24} height={24} className="transition-transform duration-[var(--duration-fast)]" />
          <span className="hidden xs:inline">Luna</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-3">
          <button 
            onClick={toggle} 
            className="button-base h-9 px-3 text-xs md:text-sm border border-black/10 bg-transparent hover:bg-[var(--color-neutral-light)] text-foreground min-w-[3rem]"
            aria-label={`Bytt til ${theme === "dark" ? "lys" : "mørk"} modus`}
          >
            <span className="hidden sm:inline">{theme === "dark" ? "Mørk" : "Lys"}</span>
            <span className="sm:hidden">{theme === "dark" ? "🌙" : "☀️"}</span>
          </button>
          <select
            aria-label="Velg brukerrolle"
            className="button-base h-9 px-2 md:px-3 text-xs md:text-sm border border-black/10 bg-transparent hover:bg-[var(--color-neutral-light)] text-foreground min-w-[4rem] md:min-w-[5rem]"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <option value={UserRole.OWNER}>Owner</option>
            <option value={UserRole.MANAGER}>Manager</option>
            <option value={UserRole.AGENT}>Agent</option>
          </select>
          <button 
            aria-label="Varsler" 
            className="p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-neutral-light)] transition-all duration-[var(--duration-fast)] active:scale-95 relative"
          >
            <Bell className="size-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--color-error)] rounded-full text-[10px] text-white flex items-center justify-center">3</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="text-xs text-foreground/60 hidden sm:block">
              {profile?.name || ""}
            </div>
            <button 
              aria-label="Brukermeny" 
              className="p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-neutral-light)] transition-all duration-[var(--duration-fast)] active:scale-95"
              title={profile?.email || ""}
            >
              <User2 className="size-5" />
            </button>
            <Button size="sm" variant="outline" onClick={signOut}>Logg ut</Button>
          </div>
        </div>
      </div>
    </header>
  );
}


