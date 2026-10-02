"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShieldCheck, Sparkles, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/analyze", label: "Analyze" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/evidence", label: "Evidence" },
  { href: "/jobs", label: "Jobs" },
  { href: "/tasks", label: "Tasks" },
  { href: "/portfolio", label: "Portfolio" },
];

function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className="group flex items-center gap-2.5 font-bold tracking-[0.14em] text-foreground transition-opacity hover:opacity-90"
    >
      <span className="relative flex size-8 items-center justify-center rounded-lg border border-indigo-500/30 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 text-indigo-300 shadow-xs shadow-indigo-500/10 transition-transform group-hover:scale-105">
        <ShieldCheck className="size-4.5 text-indigo-400" />
        <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-emerald-400 ring-2 ring-background" />
      </span>
      <span className="flex items-center gap-1.5 text-sm font-semibold tracking-wider text-zinc-100">
        SKILLPROOF
      </span>
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Brand />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150",
                    isActive
                      ? "text-zinc-100 bg-secondary/80 shadow-2xs font-semibold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-secondary/40"
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-2 -bottom-[11px] h-[2px] bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-2.5 py-1 text-[11px] font-medium text-emerald-300">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <Activity className="size-3 text-emerald-400" />
            <span>Deterministic Engine</span>
          </div>

          <Button
            asChild
            size="sm"
            className="h-8 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/20 shadow-xs shadow-indigo-600/20 transition-all hover:shadow-indigo-600/30"
          >
            <Link href="/analyze">
              <Sparkles className="size-3.5 mr-1" />
              Analyze Skills
            </Link>
          </Button>
        </div>

        {/* Mobile menu trigger with 44px min touch target */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="size-11 min-h-[44px] min-w-[44px] p-2.5"
              aria-label="Open navigation menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-card border-l border-border p-6 flex flex-col justify-between">
            <div>
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="mt-2">
                <Brand onClick={() => setMobileMenuOpen(false)} />
              </div>
              <div className="mt-6 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] p-2 text-xs text-emerald-300">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                Deterministic Phase 4 Engine
              </div>
              <nav className="mt-6 grid gap-2" aria-label="Mobile navigation">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3.5 py-3 text-sm font-medium transition-colors min-h-[44px]",
                        isActive
                          ? "bg-secondary text-foreground font-semibold"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      )}
                    >
                      {item.label}
                      {isActive && <span className="size-2 rounded-full bg-indigo-400" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <Button
              asChild
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-11 min-h-[44px]"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Link href="/analyze">Start analysis</Link>
            </Button>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
