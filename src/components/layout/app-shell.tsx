import { type ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        {children}
      </main>
    </div>
  );
}
