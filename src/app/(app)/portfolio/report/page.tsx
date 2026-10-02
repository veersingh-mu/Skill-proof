import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PortfolioReportView } from "@/components/portfolio/portfolio-report-view";

export default function PortfolioReportPage() {
  return (
    <AppShell>
      <div className="pt-4">
        <Suspense fallback={<div className="py-20 text-center text-xs text-muted-foreground">Loading report...</div>}>
          <PortfolioReportView />
        </Suspense>
      </div>
    </AppShell>
  );
}
