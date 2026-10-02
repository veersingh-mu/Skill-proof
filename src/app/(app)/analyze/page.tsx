import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ResumeAnalysisFlow } from "@/components/resume/resume-analysis-flow";

export default function AnalyzePage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Candidate intake"
        title="Analyze your skills"
        description="Upload a text-based resume to extract technical claims, confirm your claims, and mine GitHub for factual evidence."
      />
      <ResumeAnalysisFlow />
    </AppShell>
  );
}
