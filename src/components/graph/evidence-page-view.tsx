"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type CandidateVerificationSession,
  createSampleVerificationSession,
  loadVerificationSession,
} from "@/lib/evidence";
import { EvidenceGraphView } from "./evidence-graph-view";
import { CandidateHeader } from "../dashboard/candidate-header";
import { CandidateModeBanner } from "@/components/shared/candidate-mode-banner";

export function EvidencePageView() {
  const [sessionState] = useState<{
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

  if (!session) return null;

  return (
    <div className="space-y-6 pb-12">
      <CandidateModeBanner
        isSample={isSample}
        githubUsername={session.githubUsername}
        candidateName={session.candidate.name}
        pageContext="evidence"
        showBackToDashboard={true}
      />

      <CandidateHeader
        candidateName={session.candidate.name || "Candidate"}
        githubUsername={session.githubUsername}
        analyzedAt={session.analyzedAt}
        isSampleSession={isSample}
      />

      <div className="flex items-center justify-between">
        <Button asChild variant="outline" size="sm" className="text-xs gap-1.5">
          <Link href="/dashboard">
            <ArrowLeft className="size-3.5" /> Back to Dashboard Overview
          </Link>
        </Button>
      </div>

      <EvidenceGraphView session={session} />
    </div>
  );
}
