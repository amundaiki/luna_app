"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { UserRole } from "@/src/types/core";

interface RoleContextValue {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(UserRole.OWNER);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("lp_role") : null;
    if (stored === UserRole.OWNER || stored === UserRole.MANAGER || stored === UserRole.AGENT) {
      setRole(stored);
    }
  }, []);

  const value = useMemo<RoleContextValue>(() => ({
    role,
    setRole: (r) => {
      setRole(r);
      try { window.localStorage.setItem("lp_role", r); } catch {}
    },
  }), [role]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}


