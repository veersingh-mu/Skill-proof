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
import { CandidateModeBanner } from "@/components/shared/candidate-mode-banner";

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
      <div className="py-20 text-center text-xs text-[#756B64]">
        Loading SkillProof Portfolio...
      </div>
    );
  }

  const { candidate, summary, skills, verificationHistory, tasks, skillGaps, jobMatch } = portfolio;
  const isSample = typeof window !== "undefined"
    ? (!loadVerificationSession() || candidate.githubUsername === "pratyushwakde24-source")
    : true;

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      <CandidateModeBanner
        isSample={isSample}
        githubUsername={candidate.githubUsername || "pratyushwakde24-source"}
        candidateName={candidate.name}
        pageContext="portfolio"
        showBackToDashboard={true}
      />

      {/* 1. Header & Candidate Summary */}
      <div className="rounded-2xl border border-[#E7DCD1] bg-white p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A95F3D]">
              <div className="flex size-6 items-center justify-center rounded-lg bg-[#F4E2D3] text-[#A95F3D]">
                <ShieldCheck className="size-3.5" />
              </div>
              Verified Technical Portfolio
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241914] tracking-tight">
              {candidate.name}
            </h1>
            <p className="text-xs text-[#756B64] flex flex-wrap items-center gap-2">
              {candidate.githubUsername && (
                <>
                  <span className="font-mono text-[#241914] font-bold">github.com/{candidate.githubUsername}</span>
                  <span className="text-[#E7DCD1]">·</span>
                </>
              )}
              <span>Observable technical evidence directly mined from public GitHub repositories.</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 print:hidden w-full sm:w-auto">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="text-xs font-semibold h-10 min-h-[40px] px-4 border-[#E7DCD1] text-[#241914] hover:bg-[#FAF7F2] rounded-xl flex-1 sm:flex-none"
            >
              <Link href="/portfolio/report">
                <Share2 className="size-3.5 mr-1.5 text-[#A95F3D]" />
                Shareable Report
              </Link>
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="text-xs font-semibold h-10 min-h-[40px] px-4 border-[#E7DCD1] text-[#241914] hover:bg-[#FAF7F2] rounded-xl flex-1 sm:flex-none"
            >
              <Printer className="size-3.5 mr-1.5 text-[#756B64]" />
              Print / Save PDF
            </Button>

            <Button
              asChild
              size="sm"
              className="w-full sm:w-auto bg-[#A95F3D] text-white hover:bg-[#8E4F32] font-bold text-xs h-10 min-h-[40px] px-5 rounded-xl shadow-xs"
            >
              <Link href="/evidence">
                <Network className="size-3.5 mr-1.5" />
                Explore Evidence Graph
              </Link>
            </Button>
          </div>
        </div>

        {/* 2. Coverage Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-3 border-t border-[#E7DCD1]">
          <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E7DCD1] text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#756B64] block">
              Claimed
            </span>
            <span className="text-xl font-extrabold text-[#241914] font-mono">
              {summary.claimedSkillsCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#E3F3E8] border border-[#2E8B57]/30 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E8B57] block">
              Verified
            </span>
            <span className="text-xl font-extrabold text-[#2E8B57] font-mono">
              {summary.provenCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#FFF0D7] border border-[#D99125]/30 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D99125] block">
              Partial
            </span>
            <span className="text-xl font-extrabold text-[#D99125] font-mono">
              {summary.partialCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E7DCD1] text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#756B64] block">
              Insufficient
            </span>
            <span className="text-xl font-extrabold text-[#756B64] font-mono">
              {summary.insufficientCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E7DCD1] text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#756B64] block">
              Repositories
            </span>
            <span className="text-xl font-extrabold text-[#241914] font-mono">
              {summary.repositoryCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E7DCD1] text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#756B64] block">
              Evidence Items
            </span>
            <span className="text-xl font-extrabold text-[#241914] font-mono">
              {summary.evidenceCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E7DCD1] text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#756B64] block">
              Avg Score
            </span>
            <span className="text-xl font-extrabold text-[#A95F3D] font-mono">
              {summary.averageScore}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E7DCD1] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("matrix")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "matrix"
              ? "bg-[#241914] text-white shadow-xs"
              : "text-[#756B64] hover:text-[#241914] hover:bg-white"
          }`}
        >
          Skill Proof Matrix ({skills.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "history"
              ? "bg-[#241914] text-white shadow-xs"
              : "text-[#756B64] hover:text-[#241914] hover:bg-white"
          }`}
        >
          <span>Proof History</span>
          {verificationHistory.length > 0 && (
            <span className="size-2 rounded-full bg-[#2E8B57]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tasks")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "tasks"
              ? "bg-[#241914] text-white shadow-xs"
              : "text-[#756B64] hover:text-[#241914] hover:bg-white"
          }`}
        >
          Completed Tasks ({tasks.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("gaps")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "gaps"
              ? "bg-[#241914] text-white shadow-xs"
              : "text-[#756B64] hover:text-[#241914] hover:bg-white"
          }`}
        >
          Remaining Gaps ({skillGaps.length})
        </button>
      </div>

      {/* 4. Tab Content */}
      {activeTab === "matrix" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <SkillMatrix
              skills={skills}
              selectedSkill={selectedSkill}
              onSelectSkill={(s) => setUserSelectedSkill(s)}
            />
          </div>

          <div className="lg:col-span-5">
            {selectedSkill ? (
              <SkillDetailPanel skill={selectedSkill} />
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-[#E7DCD1] bg-white text-center text-xs text-[#756B64]">
                Select a skill from the matrix to inspect its evidence trail.
              </div>
            )}
          </div>
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

      {/* Optional Job Match Context */}
      {jobMatch && (
        <div className="pt-4 border-t border-[#E7DCD1]">
          <JobMatchContext jobMatch={jobMatch} />
        </div>
      )}
    </div>
  );
}
