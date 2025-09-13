"use client";

import { createContext, useContext, ReactNode } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

interface SupabaseContextValue {
  supabase: SupabaseClient | null;
}

const SupabaseContext = createContext<SupabaseContextValue | null>(null);

// Singleton Supabase client instance
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wvxdezrvhjrvypcseiuc.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2eGRlenJ2aGpydnlwY3NlaXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NTExMTMsImV4cCI6MjA3MzMyNzExM30.H66mGSDrAnyxFouWcbMHMrp8kRMl-O7BoqFTNTq4eu0";

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or key missing");
    return null;
  }

  supabaseInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  console.log("Supabase client created successfully");
  return supabaseInstance;
}

interface SupabaseProviderProps {
  children: ReactNode;
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const supabase = getSupabaseClient();

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error("useSupabase must be used within SupabaseProvider");
  if (!ctx.supabase) {
    throw new Error(
      "Supabase ikke konfigurert. Sett NEXT_PUBLIC_SUPABASE_URL og NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return ctx;
}


