"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/src/providers/supabase-provider";
import { useAuth } from "@/src/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

export default function LoginPage() {
  const { supabase } = useSupabase();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/leads");
    }
  }, [loading, user, router]);

  async function handleMagicLink() {
    if (!supabase) return;
    if (!email || !email.includes("@")) {
      toast.error("Ugyldig e-postadresse");
      return;
    }
    try {
      setIsSending(true);
      const runtimeOrigin = typeof window !== "undefined" ? window.location.origin : "";
      const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
      const fallbackProd = "https://luna-app-flax.vercel.app"; // fallback hvis localhost oppdages
      const base = configured
        ? configured
        : (runtimeOrigin && !/localhost|127\.0\.0\.1/.test(runtimeOrigin))
          ? runtimeOrigin.replace(/\/$/, "")
          : fallbackProd;
      const normalized = base.replace(/\/$/, "");
      const redirectTo = normalized ? `${normalized}/leads` : undefined;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (error) throw error;
      toast.success("Magisk lenke sendt", { description: "Sjekk e-posten din" });
    } catch (err: any) {
      toast.error("Kunne ikke sende lenke", { description: err?.message });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Logg inn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <label className="text-sm font-medium">E-post</label>
            <Input
              type="email"
              placeholder="din@epost.no"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={handleMagicLink} disabled={isSending} className="w-full">
              {isSending ? "Sender..." : "Send magisk lenke"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



