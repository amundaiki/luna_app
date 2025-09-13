import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/src/providers/query-provider";
import { SupabaseProvider } from "@/src/providers/supabase-provider";
import { AuthProvider } from "@/src/providers/auth-provider";
import { RoleProvider } from "@/src/providers/role-provider";
import { ThemeProvider } from "@/src/providers/theme-provider";
import { Toaster } from "@/src/components/ui/toast";
import { ErrorBoundary } from "@/src/components/ui/error-boundary";
import { OfflineIndicator, PWAInstallPrompt } from "@/src/components/ui/offline-indicator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Luna",
  description: "PWA for leads, kampanjer og statistikk",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <ErrorBoundary>
          <QueryProvider>
            <SupabaseProvider>
              <AuthProvider>
                <RoleProvider>
                  <ThemeProvider>
                    {children}
                  </ThemeProvider>
                </RoleProvider>
              </AuthProvider>
            </SupabaseProvider>
          </QueryProvider>
        </ErrorBoundary>
        <Toaster richColors position="top-center" />
        <OfflineIndicator />
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
