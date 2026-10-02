"use client";

import { useState } from "react";
import Link from "next/link";
import { FileSearch, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type CandidateVerificationSession,
  clearVerificationSession,
  createSampleVerificationSession,
  loadVerificationSession,
} from "@/lib/evidence";
import { CandidateHeader } from "./candidate-header";
import { VerificationSummary } from "./verification-summary";
import { StatusExplanation } from "./status-explanation";
import { ClaimsVsEvidence } from "./claims-vs-evidence";
import { SkillVerificationTable } from "./skill-verification-table";
import { GitHubActivitySummary } from "./github-activity-summary";
import { EvidenceSourceSummary } from "./evidence-source-summary";
import { EvidenceGraphView } from "@/components/graph";

export function DashboardView() {
  const [sessionState, setSessionState] = useState<{
    session: CandidateVerificationSession | null;
    isSample: boolean;
  }>(() => {
    if (typeof window === "undefined") {
      return {
        session: createSampleVerificationSession(),
        isSample: true,
      };
    }
    const loaded = loadVerificationSession();
    if (loaded) {
      return { session: loaded, isSample: false };
    }
    return {
      session: createSampleVerificationSession(),
      isSample: true,
    };
  });

  const { session, isSample } = sessionState;

  function handleResetSession() {
    clearVerificationSession();
    const sample = createSampleVerificationSession();
    setSessionState({
      session: sample,
      isSample: true,
    });
  }

  if (!session) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center space-y-4 max-w-xl mx-auto my-12">
        <FileSearch className="size-10 text-muted-foreground mx-auto" />
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">No Active Verification Session</h2>
          <p className="text-xs text-muted-foreground">
            Upload a resume and connect a GitHub account to run the deterministic Evidence Engine.
          </p>
        </div>
        <div className="pt-2">
          <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs">
            <Link href="/analyze">
              Analyze a Resume Now
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { candidate, githubUsername, analyzedAt, claims, githubResult, evaluation } = session;

  return (
    <div className="space-y-8 pb-12">
      {/* Notice if viewing reference data */}
      {isSample && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-blue-400/25 bg-blue-400/[0.06] text-xs text-blue-200">
          <div className="flex items-center gap-2.5">
            <UserCheck className="size-4 text-blue-400 shrink-0" />
            <span>
              <strong>Reference Candidate Mode:</strong> Displaying authentic Phase 4 verification data for <strong>@{githubUsername}</strong>. Run your own analysis at <Link href="/analyze" className="underline font-semibold hover:text-white">/analyze</Link>.
            </span>
          </div>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="text-xs border-blue-400/40 text-blue-100 hover:bg-blue-400/20 shrink-0 h-8"
          >
            <Link href="/analyze">
              Upload New Resume
            </Link>
          </Button>
        </div>
      )}

      {/* 1. Candidate Header (Requirement 10) */}
      <CandidateHeader
        candidateName={candidate.name || "Candidate"}
        githubUsername={githubUsername}
        analyzedAt={analyzedAt}
        onResetSession={handleResetSession}
        isSampleSession={isSample}
      />

      {/* 2 & 3. Verification Summary & Evidence Coverage (Requirements 2 & 3) */}
      <VerificationSummary
        summary={evaluation.summary}
        repositoryCount={githubResult?.repositories?.length ?? 0}
      />

      {/* 9. Status Definitions & Rationale Panel (Requirement 9) */}
      <StatusExplanation />

      {/* 13. Claims vs Evidence Pipeline (Requirement 13) */}
      <ClaimsVsEvidence claims={claims} verifications={evaluation.verifications} />

      {/* Phase 6 — Interactive Evidence Graph (Requirements 1-14) */}
      <div id="interactive-evidence-graph">
        <EvidenceGraphView session={session} />
      </div>

      {/* 4, 5, 6, 7, 8. Filterable, Searchable, Sortable Skill Verification Table (Requirements 4, 5, 6, 7, 8) */}
      <div className="space-y-3">
        <div className="border-b border-border/60 pb-3">
          <h2 className="text-base font-bold text-foreground tracking-tight">
            Skill Verification Results
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Each skill claim evaluated deterministically against factual GitHub repository activity.
          </p>
        </div>

        <SkillVerificationTable verifications={evaluation.verifications} />
      </div>

      {/* 11. GitHub Activity Summary (Requirement 11) */}
      <GitHubActivitySummary result={githubResult} />

      {/* 12. Evidence Sources Breakdown (Requirement 12) */}
      <EvidenceSourceSummary
        evidence={githubResult.evidence}
        repositoryCount={githubResult.summary.repositoriesAnalyzed}
      />
    </div>
  );
}
