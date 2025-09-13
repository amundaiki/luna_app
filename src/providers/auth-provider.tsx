"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User as SupabaseAuthUser, Session, SupabaseClient } from "@supabase/supabase-js";
import { useSupabase } from "@/src/providers/supabase-provider";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "owner" | "manager" | "agent";
  customer_id: string;
  avatar_url?: string | null;
}

interface AuthContextValue {
  user: SupabaseAuthUser | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<SupabaseAuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function init(client: SupabaseClient) {
      try {
        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        if (!isMounted) return;
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
      } catch (err) {
        console.error("Auth getSession error", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    init(supabase);

    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      isMounted = false;
      try { sub?.subscription?.unsubscribe(); } catch {}
    };
  }, [supabase]);

  // Load or bootstrap user profile from application users table
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    if (!user) {
      setProfile(null);
      return;
    }

    const authUser = user; // capture non-null user for TS
    let cancelled = false;

    async function loadProfile(clientParam: SupabaseClient, u: SupabaseAuthUser) {
      try {
        // Try to find user by auth user id first, then by email as fallback
        const { data, error } = await clientParam
          .from("users")
          .select("id, email, name, role, customer_id, avatar_url")
          .or(`id.eq.${u.id},email.eq.${u.email || ""}`)
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          // Bootstrap minimal profile for demo/dev environments
          const email = u.email || `user-${u.id}@example.com`;
          const name = u.user_metadata?.name || email.split("@")[0];
          const defaultCustomerId = "11111111-1111-1111-1111-111111111111";
          const insert = await clientParam
            .from("users")
            .insert({
              id: u.id,
              email,
              name,
              role: "agent",
              customer_id: defaultCustomerId,
            })
            .select("id, email, name, role, customer_id, avatar_url")
            .single();

          if (insert.error) throw insert.error;
          if (!cancelled) setProfile(insert.data as UserProfile);
          return;
        }

        if (!cancelled) setProfile(data as UserProfile);
      } catch (err: any) {
        console.error("Load profile error", err);
        toast.error("Kunne ikke laste brukerprofil", { description: err?.message });
      }
    }

    loadProfile(client, authUser);
    return () => {
      cancelled = true;
    };
  }, [supabase, user]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    profile,
    loading,
    signOut: async () => {
      if (!supabase) return;
      await supabase.auth.signOut();
      toast.success("Du er logget ut");
    },
  }), [user, session, profile, loading, supabase]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


