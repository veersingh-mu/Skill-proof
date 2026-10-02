import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { PortfolioView } from "@/components/portfolio/portfolio-view";

export default function PortfolioPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Phase 11 — Proof Portfolio"
        title="SkillProof Evidence Portfolio"
        description="Don't just claim skills. Prove them. Inspect observable GitHub evidence, verification histories, completed practical tasks, and remaining gaps."
      />
      <div className="mt-8">
        <Suspense fallback={<div className="py-20 text-center text-xs text-muted-foreground">Loading portfolio...</div>}>
          <PortfolioView />
        </Suspense>
      </div>
    </AppShell>
  );
}
