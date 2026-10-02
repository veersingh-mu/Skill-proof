import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EvidencePageView } from "@/components/graph/evidence-page-view";

export default function EvidencePage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Interactive Graph"
        title="Skill Verification Graph"
        description="Visualize and trace deterministic technical evidence from resume claims to GitHub artifacts."
      />
      <div className="mt-8">
        <EvidencePageView />
      </div>
    </AppShell>
  );
}
