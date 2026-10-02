import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default function DashboardPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Skill Verification"
        title="Skill verification overview"
        description="Factual, deterministic verification powered by the Phase 4 Evidence Engine. Zero speculation, 100% auditable proof."
      />
      <div className="mt-8">
        <DashboardView />
      </div>
    </AppShell>
  );
}
