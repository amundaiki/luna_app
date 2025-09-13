"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/src/providers/auth-provider";
import { LoadingSpinner } from "@/src/components/ui/skeleton";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const bypass = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";

  useEffect(() => {
    if (loading) return;
    if (!bypass && !user && path !== "/login") {
      router.replace("/login");
    }
  }, [user, loading, router, path, bypass]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-10">
        <LoadingSpinner />
      </div>
    );
  }

  if (!bypass && !user && path !== "/login") {
    return null;
  }

  return <>{children}</>;
}


