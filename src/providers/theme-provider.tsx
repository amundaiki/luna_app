"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

type Theme = "light" | "dark";
interface ThemeContextValue { theme: Theme; toggle: () => void; }

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("lp_theme") as Theme | null : null;
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = theme;
      try { window.localStorage.setItem("lp_theme", theme); } catch {}
    }
  }, [theme]);

  const value = useMemo(() => ({ theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}


