"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { UserRole } from "@/src/types/core";
import { useAuth } from "@/src/providers/auth-provider";

interface RoleContextValue {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [role, setRole] = useState<UserRole>(UserRole.AGENT);

  useEffect(() => {
    if (profile?.role === "owner") setRole(UserRole.OWNER);
    else if (profile?.role === "manager") setRole(UserRole.MANAGER);
    else if (profile?.role === "agent") setRole(UserRole.AGENT);
  }, []);

  const value = useMemo<RoleContextValue>(() => ({
    role,
    setRole: (r) => {
      setRole(r);
    },
  }), [role]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}


