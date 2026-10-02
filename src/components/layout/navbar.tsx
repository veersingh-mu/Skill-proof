"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShieldCheck, Sparkles, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Home" },
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
      className="group flex items-center gap-2.5 font-bold tracking-[0.08em] text-[#241914] transition-opacity hover:opacity-90"
    >
      <span className="relative flex size-8 items-center justify-center rounded-lg border border-[#A95F3D]/30 bg-[#F4E2D3] text-[#A95F3D] shadow-xs transition-transform group-hover:scale-105">
        <ShieldCheck className="size-4.5 text-[#A95F3D]" />
        <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#2E8B57] ring-2 ring-white" />
      </span>
      <span className="flex items-center gap-1 text-base font-bold tracking-tight text-[#241914]">
        SkillProof
      </span>
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E7DCD1] bg-[#FAF7F2]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Brand />
          <nav className="hidden items-center gap-1.5 md:flex" aria-label="Primary navigation">
            {navigation.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150",
                    isActive
                      ? "text-[#241914] bg-[#F7EFE7] font-semibold border border-[#E7DCD1]"
                      : "text-[#756B64] hover:text-[#241914] hover:bg-[#F7EFE7]/60"
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="sr-only">(current page)</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-3.5 md:flex">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#2E8B57]/30 bg-[#E3F3E8] px-3 py-1 text-[11px] font-medium text-[#2E8B57]">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2E8B57] opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-[#2E8B57]" />
            </span>
            <Activity className="size-3 text-[#2E8B57]" />
            <span>Deterministic Engine</span>
          </div>

          <Button
            asChild
            size="sm"
            className="h-9 px-4 text-xs font-semibold bg-[#A95F3D] hover:bg-[#8F4E30] text-white shadow-xs rounded-full transition-all"
          >
            <Link href="/analyze">
              <Sparkles className="size-3.5 mr-1" />
              Analyze Skills
            </Link>
          </Button>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            asChild
            size="sm"
            className="h-8 px-3 text-xs font-semibold bg-[#A95F3D] hover:bg-[#8F4E30] text-white rounded-full"
          >
            <Link href="/analyze">Analyze</Link>
          </Button>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 min-h-[40px] min-w-[40px] text-[#241914] hover:bg-[#F7EFE7]"
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-[#FAF7F2] border-l border-[#E7DCD1] p-6 flex flex-col justify-between">
              <div>
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="mt-2">
                  <Brand onClick={() => setMobileMenuOpen(false)} />
                </div>
                <div className="mt-5 flex items-center gap-2 rounded-xl border border-[#2E8B57]/30 bg-[#E3F3E8] p-2.5 text-xs text-[#2E8B57] font-medium">
                  <span className="size-2 rounded-full bg-[#2E8B57] animate-pulse" />
                  Deterministic Engine Active
                </div>
                <nav className="mt-6 grid gap-1.5" aria-label="Mobile navigation">
                  {navigation.map((item) => {
                    const isActive =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname === item.href || pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors min-h-[44px]",
                          isActive
                            ? "bg-white text-[#241914] font-bold border border-[#E7DCD1] shadow-xs"
                            : "text-[#756B64] hover:bg-[#F7EFE7] hover:text-[#241914]"
                        )}
                      >
                        {item.label}
                        {isActive && <span className="size-2 rounded-full bg-[#A95F3D]" />}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <Button
                asChild
                className="w-full bg-[#A95F3D] hover:bg-[#8F4E30] text-white text-xs h-11 min-h-[44px] rounded-xl font-semibold shadow-xs"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/analyze">Start Skill Analysis</Link>
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
