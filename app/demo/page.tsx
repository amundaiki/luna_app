"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/src/providers/supabase-provider";

export default function DemoPage() {
  const router = useRouter();
  const { supabase } = useSupabase();

  useEffect(() => {
    async function setupDemo() {
      try {
        // Auto-login med demo bruker
        const { error } = await supabase.auth.signInWithPassword({
          email: 'demo@luna.no',
          password: 'Demo123!'
        });

        if (!error) {
          // Redirect til dashboard
          router.push('/dashboard');
        } else {
          console.error('Demo login failed:', error);
          // Fallback: redirect til normal login
          router.push('/');
        }
      } catch (error) {
        console.error('Demo setup error:', error);
        router.push('/');
      }
    }

    setupDemo();
  }, [supabase, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">
          Starter Luna Demo
        </h1>
        <p className="text-gray-600">
          Logger deg inn automatisk...
        </p>
      </div>
    </div>
  );
}
