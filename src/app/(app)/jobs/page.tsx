"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { JobMatchingView } from "@/components/jobs/job-matching-view";

export default function JobsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Phase 7 — Job Matching"
        title="Evidence-Based Job Description Matching"
        description="Compare technical job requirements against verified candidate GitHub evidence. Pure deterministic matching with zero hiring predictions."
      />
      <div className="mt-8">
        <JobMatchingView />
      </div>
    </AppShell>
  );
}
