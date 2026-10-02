"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Network,
  Printer,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadVerificationSession } from "@/lib/evidence/session";
import { createSampleVerificationSession } from "@/lib/evidence/sample-session";
import { loadTaskSubmissions } from "@/lib/tasks/storage";
import { buildSkillProofPortfolio } from "@/lib/portfolio/builder";
import type { SkillProofPortfolio, SkillPortfolioItem } from "@/lib/portfolio/types";
import type { JobMatchEvaluation } from "@/lib/jobs/types";
import { SkillMatrix } from "./skill-matrix";
import { SkillDetailPanel } from "./skill-detail-panel";
import { VerificationTimeline } from "./verification-timeline";
import { TaskHistory } from "./task-history";
import { RemainingGaps } from "./remaining-gaps";
import { JobMatchContext } from "./job-match-context";

function loadInitialPortfolio(): SkillProofPortfolio {
  if (typeof window === "undefined") {
    return buildSkillProofPortfolio(null);
  }

  const session = loadVerificationSession() || createSampleVerificationSession();
  const taskSubmissions = loadTaskSubmissions();

  let jobMatch: JobMatchEvaluation | null = null;
  try {
    const rawMatch = sessionStorage.getItem("skillproof_last_match");
    if (rawMatch) {
      jobMatch = JSON.parse(rawMatch) as JobMatchEvaluation;
    }
  } catch {
    // sessionStorage unavailable
  }

  return buildSkillProofPortfolio(session, taskSubmissions, jobMatch);
}

export function PortfolioView() {
  const searchParams = useSearchParams();
  const querySkill = searchParams.get("skill");

  const [portfolio] = useState<SkillProofPortfolio>(loadInitialPortfolio);
  const [userSelectedSkill, setUserSelectedSkill] = useState<SkillPortfolioItem | null>(null);
  const [activeTab, setActiveTab] = useState<"matrix" | "history" | "tasks" | "gaps">("matrix");

  const selectedSkill =
    userSelectedSkill ??
    (querySkill
      ? portfolio.skills.find((s) => s.skill.toLowerCase() === querySkill.toLowerCase()) ??
        (portfolio.skills[0] ?? null)
      : (portfolio.skills[0] ?? null));

  if (!portfolio) {
    return (
      <div className="py-20 text-center text-xs text-muted-foreground">
        Loading SkillProof Portfolio...
      </div>
    );
  }

  const { candidate, summary, skills, verificationHistory, tasks, skillGaps, jobMatch } = portfolio;

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* 1. Header & Candidate Summary */}
      <div className="rounded-xl border border-border/80 bg-gradient-to-b from-card/80 to-card/40 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <ShieldCheck className="size-4" />
              Verified Evidence Portfolio
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {candidate.name}
            </h1>
            <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
              {candidate.githubUsername && (
                <>
                  <span className="font-mono text-foreground/80">github.com/{candidate.githubUsername}</span>
                  <span>·</span>
                </>
              )}
              <span>Observable technical evidence directly mined from public GitHub repositories.</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 print:hidden">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="text-xs h-9 border-border hover:bg-muted"
            >
              <Link href="/portfolio/report">
                <Share2 className="size-3.5 mr-1.5" />
                Presentation Report
              </Link>
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="text-xs h-9 border-border hover:bg-muted"
            >
              <Printer className="size-3.5 mr-1.5" />
              Print / Save PDF
            </Button>

            <Button
              asChild
              size="sm"
              className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-semibold text-xs h-9"
            >
              <Link href="/evidence">
                <Network className="size-3.5 mr-1.5" />
                Explore Evidence Graph
              </Link>
            </Button>
          </div>
        </div>

        {/* 2. Coverage Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2 border-t border-border/60">
          <div className="p-3 rounded-lg bg-background/50 border border-border/40 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Claimed
            </span>
            <span className="text-lg font-bold text-foreground font-mono">
              {summary.claimedSkillsCount}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/20 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
              Proven
            </span>
            <span className="text-lg font-bold text-emerald-300 font-mono">
              {summary.provenCount}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/[0.06] border border-amber-500/20 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              Partial
            </span>
            <span className="text-lg font-bold text-amber-300 font-mono">
              {summary.partialCount}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-secondary/40 border border-border text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Claimed Only
            </span>
            <span className="text-lg font-bold text-zinc-200 font-mono">
              {summary.insufficientCount}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-background/50 border border-border/40 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Repositories
            </span>
            <span className="text-lg font-bold text-foreground font-mono">
              {summary.repositoryCount}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-background/50 border border-border/40 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Evidence Items
            </span>
            <span className="text-lg font-bold text-foreground font-mono">
              {summary.evidenceCount}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-background/50 border border-border/40 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Average Score
            </span>
            <span className="text-lg font-bold text-foreground font-mono">
              {summary.averageScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("matrix")}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "matrix"
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Skill Proof Matrix ({skills.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "history"
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <span>Proof History</span>
          {verificationHistory.length > 0 && (
            <span className="size-1.5 rounded-full bg-emerald-400" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tasks")}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "tasks"
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Completed Tasks ({tasks.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("gaps")}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "gaps"
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Remaining Gaps ({skillGaps.length})
        </button>
      </div>

      {/* 4. Tab Contents */}
      {activeTab === "matrix" && (
        <div className="space-y-6">
          <SkillMatrix
            skills={skills}
            selectedSkill={selectedSkill}
            onSelectSkill={(s) => setUserSelectedSkill(s)}
          />

          <SkillDetailPanel skill={selectedSkill} />
        </div>
      )}

      {activeTab === "history" && (
        <VerificationTimeline timeline={verificationHistory} />
      )}

      {activeTab === "tasks" && (
        <TaskHistory tasks={tasks} />
      )}

      {activeTab === "gaps" && (
        <RemainingGaps gaps={skillGaps} />
      )}

      {/* 5. Job Match Context (always visible if available) */}
      <JobMatchContext jobMatch={jobMatch} />
    </div>
  );
}
