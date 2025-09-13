import { Header } from "@/src/components/layout/header";
import { Sidebar } from "@/src/components/layout/sidebar";
import { MobileNav } from "@/src/components/layout/mobile-nav";
import { RequireAuth } from "@/src/routes/require-auth";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4 lg:gap-6">
          <Sidebar />
          <main className="pb-20 md:pb-6 min-w-0 animate-fade-in">
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
    </RequireAuth>
  );
}


