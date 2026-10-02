"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileSearch, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSampleVerificationSession } from "@/lib/evidence/sample-session";
import {
  type CandidateVerificationSession,
  loadVerificationSession,
} from "@/lib/evidence/session";
import type { JobDescriptionAnalysis, JobMatchEvaluation } from "@/lib/jobs/types";
import { extractJobRequirements, matchJobRequirements } from "@/lib/jobs";
import { detectSkillGaps } from "@/lib/gaps";
import { JobDescriptionInput } from "./job-description-input";
import { JobRequirements } from "./job-requirements";
import { JobMatchSummary } from "./job-match-summary";
import { JobMatchResults } from "./job-match-results";
import { GapSummaryCards } from "@/components/gaps/gap-summary-cards";
import { GapList } from "@/components/gaps/gap-list";

export function JobMatchingView() {
  const [sessionState] = useState<{
    session: CandidateVerificationSession;
    isSample: boolean;
  }>(() => {
    if (typeof window === "undefined") {
      return {
        session: createSampleVerificationSession(),
        isSample: true,
      };
    }
    const loaded = loadVerificationSession();
    if (loaded && loaded.evaluation) {
      return { session: loaded, isSample: false };
    }
    return {
      session: createSampleVerificationSession(),
      isSample: true,
    };
  });

  const { session, isSample } = sessionState;
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<JobDescriptionAnalysis | null>(null);
  const [matchEvaluation, setMatchEvaluation] = useState<JobMatchEvaluation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"gaps" | "matches">("gaps");

  const gapAnalysis = useMemo(() => {
    if (!matchEvaluation) return null;
    return detectSkillGaps(matchEvaluation);
  }, [matchEvaluation]);

  const handleAnalyze = async (title: string, description: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Ensure we have a valid session
      const activeSession = session || createSampleVerificationSession();

      // We can call the backend API endpoint or run local deterministic extraction
      const response = await fetch("/api/jobs/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || undefined,
          description,
          session: activeSession,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to analyze job description.");
      }

      const data = await response.json();
      setAnalysis(data.job);
      setMatchEvaluation(data.match);
      // Persist for /tasks page — no tokens, match data only
      try { sessionStorage.setItem("skillproof_last_match", JSON.stringify(data.match)); } catch { /* storage unavailable */ }
    } catch (err: unknown) {
      // Graceful fallback to client-side deterministic evaluation if network issues occur
      console.warn("API call failed, running deterministic client-side evaluation:", err);
      try {
        const activeSession = session || createSampleVerificationSession();
        const extracted = extractJobRequirements(description, title);
        const matched = matchJobRequirements(extracted, activeSession);
        setAnalysis(extracted);
        setMatchEvaluation(matched);
        try { sessionStorage.setItem("skillproof_last_match", JSON.stringify(matched)); } catch { /* storage unavailable */ }
      } catch {
        setErrorMessage(
          err instanceof Error ? err.message : "Unable to analyze job description."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAnalysis = () => {
    setAnalysis(null);
    setMatchEvaluation(null);
    setErrorMessage(null);
  };

  if (!session) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center space-y-4 max-w-xl mx-auto my-12">
        <FileSearch className="size-10 text-muted-foreground mx-auto" />
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">Loading Verification Data...</h2>
        </div>
      </div>
    );
  }

  const candidateName = session.candidate?.name || "Candidate";
  const githubUsername = session.githubUsername;

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Reference candidate banner if viewing fallback */}
      {isSample && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-blue-400/25 bg-blue-400/[0.06] text-xs text-blue-200">
          <div className="flex items-center gap-2.5">
            <UserCheck className="size-4 text-blue-400 shrink-0" />
            <span>
              <strong>Reference Candidate Mode:</strong> Comparing requirements against verified evidence for <strong>{candidateName}</strong> (<strong>@{githubUsername}</strong>).
            </span>
          </div>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="text-xs border-blue-400/40 text-blue-100 hover:bg-blue-400/20 shrink-0 h-8"
          >
            <Link href="/analyze">
              Analyze Your Resume
            </Link>
          </Button>
        </div>
      )}

      {/* Candidate Verification Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/70 bg-card/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
            {candidateName[0] || "C"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">{candidateName}</span>
              <span className="text-xs text-muted-foreground font-mono">@{githubUsername}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {session.evaluation?.summary?.provenCount || 0} PROVEN · {session.evaluation?.summary?.partialCount || 0} PARTIAL · {session.evaluation?.summary?.claimedOnlyCount || 0} CLAIMED-ONLY skills
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-xs border-border hover:bg-muted text-foreground"
          >
            <Link href="/dashboard">
              View Candidate Dashboard
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-xs border-border hover:bg-muted text-foreground"
          >
            <Link href="/evidence">
              View Evidence Graph
            </Link>
          </Button>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Step 1: Input Job Description */}
      <JobDescriptionInput onAnalyze={handleAnalyze} isLoading={isLoading} />

      {/* Step 2: Extracted Requirements */}
      {analysis && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <JobRequirements analysis={analysis} />

          {/* Step 3: Coverage Metrics & Summary */}
          {matchEvaluation && (
            <>
              <JobMatchSummary
                metrics={matchEvaluation.metrics}
                candidateName={candidateName}
                githubUsername={githubUsername}
              />

              {/* View Switcher: Skill Gap Analysis vs Requirement Match Matrix */}
              {gapAnalysis && (
                <div className="space-y-6">
                  <div className="flex border-b border-border/60 gap-5 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveView("gaps")}
                      className={`pb-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
                        activeView === "gaps"
                          ? "border-emerald-400 text-emerald-300"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <AlertTriangle className="size-3.5 text-amber-400" />
                      Skill Gap Analysis ({gapAnalysis.gaps.length} Gap{gapAnalysis.gaps.length === 1 ? "" : "s"})
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveView("matches")}
                      className={`pb-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
                        activeView === "matches"
                          ? "border-emerald-400 text-emerald-300"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <CheckCircle2 className="size-3.5 text-emerald-400" />
                      Requirement Match Matrix
                    </button>
                  </div>

                  {activeView === "gaps" ? (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <GapSummaryCards summary={gapAnalysis.summary} />
                      <GapList analysis={gapAnalysis} />
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-200">
                      <JobMatchResults matches={matchEvaluation.matches} />
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex justify-center pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetAnalysis}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Analyze Another Job Description
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
