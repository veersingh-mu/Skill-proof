"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type CandidateVerificationSession,
  createSampleVerificationSession,
  loadVerificationSession,
} from "@/lib/evidence";
import { EvidenceGraphView } from "./evidence-graph-view";
import { CandidateHeader } from "../dashboard/candidate-header";

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
      {isSample && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-blue-400/25 bg-blue-400/[0.06] text-xs text-blue-200">
          <div className="flex items-center gap-2.5">
            <UserCheck className="size-4 text-blue-400 shrink-0" />
            <span>
              <strong>Reference Candidate Mode:</strong> Displaying graph for @{session.githubUsername}. Run your analysis at <Link href="/analyze" className="underline font-semibold hover:text-white">/analyze</Link>.
            </span>
          </div>
          <Button asChild size="sm" variant="outline" className="text-xs border-blue-400/40 text-blue-100 hover:bg-blue-400/20 shrink-0 h-8">
            <Link href="/dashboard">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      )}

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
