"use client";

import { CheckCircle2, CircleAlert, CircleDashed, FolderGit2, ShieldCheck } from "lucide-react";
import type { EvidenceEngineSummary } from "@/lib/evidence";

interface VerificationSummaryProps {
  summary: EvidenceEngineSummary;
  repositoryCount?: number;
}

export function VerificationSummary({ summary, repositoryCount = 0 }: VerificationSummaryProps) {
  const { totalClaims, provenCount, partialCount, claimedOnlyCount } = summary;

  // Percentage of resume skill claims with supporting GitHub evidence (PROVEN or PARTIAL)
  const skillsWithEvidence = provenCount + partialCount;
  const coveragePercentage = totalClaims > 0 ? Math.round((skillsWithEvidence / totalClaims) * 100) : 0;

  return (
    <section aria-label="Verification Summary" className="space-y-4">
      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Verified Skills */}
        <div className="rounded-2xl border border-[#2E8B57]/30 bg-white p-4 sm:p-5 shadow-xs transition-all hover:shadow-sm hover:border-[#2E8B57]">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E8B57]">
              Verified Skills
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-[#E3F3E8] text-[#2E8B57]">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-[#241914] font-mono">
              {provenCount}
            </span>
            <span className="text-xs text-[#756B64] font-mono">
              / {totalClaims}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#756B64]">
            Strong technical evidence
          </p>
        </div>

        {/* Partial Skills */}
        <div className="rounded-2xl border border-[#D99125]/30 bg-white p-4 sm:p-5 shadow-xs transition-all hover:shadow-sm hover:border-[#D99125]">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D99125]">
              Partial Skills
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-[#FFF0D7] text-[#D99125]">
              <CircleAlert className="size-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-[#241914] font-mono">
              {partialCount}
            </span>
            <span className="text-xs text-[#756B64] font-mono">
              / {totalClaims}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#756B64]">
            Additional evidence recommended
          </p>
        </div>

        {/* Insufficient Evidence / Gaps */}
        <div className="rounded-2xl border border-[#E7DCD1] bg-white p-4 sm:p-5 shadow-xs transition-all hover:shadow-sm hover:border-[#A95F3D]/50">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#756B64]">
              Insufficient Evidence
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-[#FAF7F2] text-[#756B64]">
              <CircleDashed className="size-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-[#241914] font-mono">
              {claimedOnlyCount}
            </span>
            <span className="text-xs text-[#756B64] font-mono">
              unverified
            </span>
          </div>
          <p className="mt-1 text-xs text-[#756B64]">
            Insufficient implementation evidence
          </p>
        </div>

        {/* Repositories */}
        <div className="rounded-2xl border border-[#A95F3D]/25 bg-white p-4 sm:p-5 shadow-xs transition-all hover:shadow-sm hover:border-[#A95F3D]">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A95F3D]">
              Repositories
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-[#F4E2D3] text-[#A95F3D]">
              <FolderGit2 className="size-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-[#241914] font-mono">
              {repositoryCount}
            </span>
            <span className="text-xs text-[#756B64] font-mono">
              sources
            </span>
          </div>
          <p className="mt-1 text-xs text-[#756B64]">
            Public repositories mined
          </p>
        </div>
      </div>

      {/* Evidence Coverage Panel */}
      <div className="rounded-2xl border border-[#E7DCD1] bg-white p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#2E8B57]" />
              <h2 className="text-xs font-bold text-[#241914] uppercase tracking-wider">
                Evidence Coverage
              </h2>
            </div>
            <p className="text-xs text-[#756B64]">
              Percentage of resume skill claims with supporting GitHub evidence.
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-2xl font-extrabold font-mono text-[#241914]">
              {coveragePercentage}%
            </span>
            <span className="text-xs text-[#756B64] ml-2 font-mono">
              ({skillsWithEvidence}/{totalClaims} skills)
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2">
          <div className="h-3.5 w-full rounded-full bg-[#FAF7F2] border border-[#E7DCD1] overflow-hidden flex">
            <div
              className="h-full bg-[#2E8B57] transition-all duration-500"
              style={{ width: `${totalClaims > 0 ? (provenCount / totalClaims) * 100 : 0}%` }}
              title={`Proven: ${provenCount}`}
            />
            <div
              className="h-full bg-[#D99125] transition-all duration-500"
              style={{ width: `${totalClaims > 0 ? (partialCount / totalClaims) * 100 : 0}%` }}
              title={`Partial: ${partialCount}`}
            />
            <div
              className="h-full bg-[#E7DCD1] transition-all duration-500"
              style={{ width: `${totalClaims > 0 ? (claimedOnlyCount / totalClaims) * 100 : 0}%` }}
              title={`Claimed-Only: ${claimedOnlyCount}`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#756B64] font-medium pt-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#2E8B57]" /> Verified ({provenCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#D99125]" /> Partial ({partialCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#E7DCD1]" /> Insufficient ({claimedOnlyCount})
              </span>
            </div>
            <span className="shrink-0 font-semibold text-[#241914]">{coveragePercentage}% evidence backed</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E7DCD1] text-xs text-[#756B64] leading-relaxed">
          <strong className="text-[#241914]">Note:</strong> Evidence coverage reflects only facts mined from public GitHub activity. This metric measures verification transparency, not candidate employability, hiring probability, or skill mastery.
        </div>
      </div>
    </section>
  );
}
