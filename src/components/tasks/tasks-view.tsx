"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Bot, BriefcaseBusiness, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSampleVerificationSession } from "@/lib/evidence/sample-session";
import { loadVerificationSession } from "@/lib/evidence/session";
import { extractJobRequirements, matchJobRequirements } from "@/lib/jobs";
import { SAMPLE_JOB_FIXTURE } from "@/components/jobs/job-description-input";
import { detectSkillGaps } from "@/lib/gaps";
import type { SkillGap } from "@/lib/gaps/types";
import type { JobMatchEvaluation } from "@/lib/jobs/types";
import type { MicroTaskResult } from "@/lib/ai/types";
import { GapSelector } from "./gap-selector";
import { MicroTaskCard } from "./micro-task-card";

interface GapsState {
  gaps: SkillGap[];
  hasJobAnalysis: boolean;
}

function loadGapsFromSession(): GapsState {
  if (typeof window === "undefined") return { gaps: [], hasJobAnalysis: false };

  try {
    const raw = sessionStorage.getItem("skillproof_last_match");
    if (raw) {
      const matchEvaluation = JSON.parse(raw) as JobMatchEvaluation;
      if (matchEvaluation?.matches && matchEvaluation?.metrics) {
        const analysis = detectSkillGaps(matchEvaluation);
        return { gaps: analysis.gaps, hasJobAnalysis: true };
      }
    }
  } catch {
    // sessionStorage unavailable or parse error
  }
  return { gaps: [], hasJobAnalysis: false };
}

type GenerationState =
  | { status: "idle" }
  | { status: "loading"; skill: string }
  | { status: "success"; result: MicroTaskResult }
  | { status: "error"; message: string; skill: string };

export function TasksView() {
  const searchParams = useSearchParams();
  const querySkill = searchParams.get("skill");

  const [gapsState, setGapsState] = useState<GapsState>(loadGapsFromSession);
  const { gaps, hasJobAnalysis } = gapsState;
  const [userSelectedGap, setUserSelectedGap] = useState<SkillGap | null>(null);
  const [genState, setGenState] = useState<GenerationState>({ status: "idle" });
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Derived selected gap: user choice -> query param -> first gap -> null
  const selectedGap = userSelectedGap ?? (
    querySkill
      ? gaps.find((g) => g.skill.toLowerCase() === querySkill.toLowerCase()) ?? (gaps[0] ?? null)
      : (gaps[0] ?? null)
  );

  const handleLoadSampleGaps = () => {
    const session = loadVerificationSession() || createSampleVerificationSession();
    const extracted = extractJobRequirements(SAMPLE_JOB_FIXTURE.description, SAMPLE_JOB_FIXTURE.title);
    const matched = matchJobRequirements(extracted, session);
    const analysis = detectSkillGaps(matched);
    try {
      sessionStorage.setItem("skillproof_last_match", JSON.stringify(matched));
    } catch {
      // ignore
    }
    setGapsState({ gaps: analysis.gaps, hasJobAnalysis: true });
    if (analysis.gaps.length > 0) {
      setUserSelectedGap(analysis.gaps[0]);
    }
  };

  const generateTask = async (gap: SkillGap) => {
    setUserSelectedGap(gap);
    setGenState({ status: "loading", skill: gap.skill });

    const gapContext = {
      skill: gap.skill,
      requirementType: gap.requirementType,
      gapType: gap.gapType,
      candidateStatus: gap.candidateStatus,
      verificationScore: gap.verificationScore,
      priority: gap.priority,
      explanation: gap.explanation,
      sourceText: gap.sourceText,
    };

    try {
      const response = await fetch("/api/tasks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillGap: gapContext }),
      });

      const data = (await response.json()) as {
        task?: MicroTaskResult["task"];
        gapContext?: MicroTaskResult["gapContext"];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "AI task generation failed. Please try again.");
      }

      setGenState({
        status: "success",
        result: { task: data.task!, gapContext: data.gapContext! },
      });
    } catch (err) {
      setGenState({
        status: "error",
        message: err instanceof Error ? err.message : "An unexpected error occurred.",
        skill: gap.skill,
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRegenerate = () => {
    if (selectedGap) {
      setIsRegenerating(true);
      void generateTask(selectedGap);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground">Your Evidence Gaps</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select a gap to generate a practical task that creates verifiable technical evidence.
            </p>
          </div>
          {!hasJobAnalysis ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                onClick={handleLoadSampleGaps}
              >
                <Sparkles className="size-3 mr-1.5 text-emerald-400" />
                Load Sample Gaps (Demo)
              </Button>
              <Button asChild size="sm" variant="outline" className="text-xs h-8 border-border hover:bg-muted shrink-0">
                <Link href="/jobs">
                  <BriefcaseBusiness className="size-3 mr-1.5" />
                  Run Job Analysis
                </Link>
              </Button>
            </div>
          ) : (
            <Button asChild size="sm" variant="outline" className="text-xs h-8 border-border hover:bg-muted shrink-0">
              <Link href="/jobs">
                <BriefcaseBusiness className="size-3 mr-1.5" />
                View Job Analysis
              </Link>
            </Button>
          )}
        </div>

        {!hasJobAnalysis ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-card/40 p-10 text-center space-y-4">
            <Bot className="size-9 text-muted-foreground mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">No skill gap analysis found</p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Analyze a job description first to identify skill gaps, or load the sample full-stack job gaps to test task generation immediately.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Button
                type="button"
                size="sm"
                className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-semibold text-xs"
                onClick={handleLoadSampleGaps}
              >
                <Sparkles className="size-3.5 mr-1.5" />
                Load Sample Gaps (Demo)
              </Button>
              <Button asChild size="sm" variant="outline" className="text-xs">
                <Link href="/jobs">Go to Job Matching</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <GapSelector
              gaps={gaps}
              selectedGap={selectedGap}
              generatingSkill={genState.status === "loading" ? genState.skill : null}
              onSelect={(gap) => setUserSelectedGap(gap)}
            />

            {/* Selected Gap Action Banner */}
            {selectedGap && genState.status !== "loading" && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                        Selected Skill Gap:
                      </span>
                      <span className="text-base font-bold text-foreground">{selectedGap.skill}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        {selectedGap.requirementType}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-200 border border-red-500/40">
                        {selectedGap.priority} PRIORITY
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        Score: {selectedGap.verificationScore}/100
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{selectedGap.explanation}</p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-semibold text-xs h-9 shrink-0 shadow-sm"
                    onClick={() => void generateTask(selectedGap)}
                  >
                    <Sparkles className="size-3.5 mr-1.5" />
                    Generate Practical Task
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {genState.status === "loading" && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] p-8 text-center space-y-3 animate-in fade-in duration-200">
          <Sparkles className="size-8 text-emerald-400 mx-auto animate-pulse" />
          <div>
            <p className="text-sm font-semibold text-foreground">Generating practical task for {genState.skill}...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Designing concrete requirements, deliverables, acceptance criteria, and expected GitHub evidence.
            </p>
          </div>
        </div>
      )}

      {genState.status === "error" && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/[0.04] p-5 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Task generation is temporarily unavailable.</p>
              <p className="text-xs text-muted-foreground">{genState.message}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs h-8 border-red-500/30 text-foreground hover:bg-red-500/10"
            onClick={handleRegenerate}
          >
            Retry
          </Button>
        </div>
      )}

      {genState.status === "success" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <MicroTaskCard
            task={genState.result.task}
            gapContext={genState.result.gapContext}
            onRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
          />
        </div>
      )}
    </div>
  );
}