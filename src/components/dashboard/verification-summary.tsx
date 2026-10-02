"use client";

import { CheckCircle2, CircleAlert, CircleDashed, Layers, ShieldCheck } from "lucide-react";
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
      {/* 4 Compact Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Verified Skills */}
        <div className="rounded-xl border border-emerald-500/25 bg-card/70 p-4 transition-colors hover:border-emerald-500/40">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-400">
              Verified Skills
            </span>
            <CheckCircle2 className="size-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {provenCount}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              / {totalClaims}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Strong technical evidence
          </p>
        </div>

        {/* Partial Skills */}
        <div className="rounded-xl border border-amber-500/25 bg-card/70 p-4 transition-colors hover:border-amber-500/40">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider text-amber-400">
              Partial Skills
            </span>
            <CircleAlert className="size-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {partialCount}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              / {totalClaims}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Some evidence exists
          </p>
        </div>

        {/* Evidence Gaps */}
        <div className="rounded-xl border border-border/80 bg-card/70 p-4 transition-colors hover:border-border">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Evidence Gaps
            </span>
            <CircleDashed className="size-4 text-zinc-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {claimedOnlyCount}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              unverified
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Insufficient qualifying evidence
          </p>
        </div>

        {/* Repositories */}
        <div className="rounded-xl border border-indigo-500/25 bg-card/70 p-4 transition-colors hover:border-indigo-500/40">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider text-indigo-400">
              Repositories
            </span>
            <Layers className="size-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {repositoryCount}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              sources
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Public repositories mined
          </p>
        </div>
      </div>

      {/* Evidence Coverage Panel */}
      <div className="rounded-xl border border-border/80 bg-card/60 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Evidence Coverage
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Percentage of resume skill claims with supporting GitHub evidence.
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-foreground">
              {coveragePercentage}%
            </span>
            <span className="text-xs text-muted-foreground ml-1.5 font-mono">
              ({skillsWithEvidence}/{totalClaims} skills)
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded-full bg-zinc-800/90 overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${totalClaims > 0 ? (provenCount / totalClaims) * 100 : 0}%` }}
              title={`Proven: ${provenCount}`}
            />
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: `${totalClaims > 0 ? (partialCount / totalClaims) * 100 : 0}%` }}
              title={`Partial: ${partialCount}`}
            />
            <div
              className="h-full bg-zinc-700/60 transition-all duration-500"
              style={{ width: `${totalClaims > 0 ? (claimedOnlyCount / totalClaims) * 100 : 0}%` }}
              title={`Claimed-Only: ${claimedOnlyCount}`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" /> Proven ({provenCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-amber-500" /> Partial ({partialCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-zinc-600" /> Claimed-Only ({claimedOnlyCount})
              </span>
            </div>
            <span>{coveragePercentage}% evidence backed</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground leading-relaxed">
          <strong>Note:</strong> Evidence coverage reflects only facts mined from public GitHub activity. This metric measures verification transparency, not candidate employability, hiring probability, or skill mastery.
        </div>
      </div>
    </section>
  );
}
