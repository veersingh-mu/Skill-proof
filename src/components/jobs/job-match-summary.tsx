"use client";

import { useState } from "react";
import { HelpCircle, Info, ShieldCheck } from "lucide-react";
import type { RequirementCoverageMetrics } from "@/lib/jobs/types";

interface JobMatchSummaryProps {
  metrics: RequirementCoverageMetrics;
  candidateName?: string;
  githubUsername?: string;
}

export function JobMatchSummary({
  metrics,
  candidateName,
  githubUsername,
}: JobMatchSummaryProps) {
  const [showFormula, setShowFormula] = useState(false);
  const { requiredCoverage, preferredCoverage, overallCoverage, requiredCounts, preferredCounts, totalRequirements } = metrics;

  return (
    <div className="space-y-4">
      {candidateName && (
        <div className="text-xs text-muted-foreground">
          Evidence evaluated for <strong>{candidateName}</strong> {githubUsername ? `(@${githubUsername})` : ""}.
        </div>
      )}
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Required Coverage */}
        <div className="rounded-xl border border-indigo-500/25 bg-gradient-to-b from-indigo-500/[0.07] to-card/50 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              Required Coverage
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {requiredCounts.verified}V · {requiredCounts.partial}P · {requiredCounts.notVerified}NV
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
              {requiredCoverage}%
            </span>
            <span className="text-xs text-muted-foreground">
              of {requiredCounts.total} required
            </span>
          </div>
          <div className="w-full bg-indigo-950/50 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, requiredCoverage))}%` }}
            />
          </div>
        </div>

        {/* Preferred Coverage */}
        <div className="rounded-xl border border-blue-500/25 bg-gradient-to-b from-blue-500/[0.07] to-card/50 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
              Preferred Coverage
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {preferredCounts.verified}V · {preferredCounts.partial}P · {preferredCounts.notVerified}NV
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
              {preferredCoverage}%
            </span>
            <span className="text-xs text-muted-foreground">
              of {preferredCounts.total} preferred
            </span>
          </div>
          <div className="w-full bg-blue-950/50 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, preferredCoverage))}%` }}
            />
          </div>
        </div>

        {/* Overall Evidence Coverage */}
        <div className="rounded-xl border border-emerald-500/25 bg-gradient-to-b from-emerald-500/[0.07] to-card/50 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
              Overall Evidence Coverage
            </span>
            <ShieldCheck className="size-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-emerald-300 font-mono">
              {overallCoverage}%
            </span>
            <span className="text-xs text-muted-foreground">
              across {totalRequirements} requirement{totalRequirements === 1 ? "" : "s"}
            </span>
          </div>
          <div className="w-full bg-emerald-950/50 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, overallCoverage))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Formula & Transparency Toggle */}
      <div className="rounded-lg border border-border/60 bg-card/40 p-3.5 text-xs text-muted-foreground">
        <button
          type="button"
          onClick={() => setShowFormula(!showFormula)}
          className="flex items-center gap-2 text-foreground font-medium hover:text-emerald-300 transition-colors w-full text-left"
        >
          <HelpCircle className="size-3.5 text-emerald-400" />
          <span>How this is calculated (Deterministic Evidence Coverage Methodology)</span>
          <span className="ml-auto text-[11px] text-muted-foreground font-mono">
            {showFormula ? "Hide details ▲" : "Show details ▼"}
          </span>
        </button>

        {showFormula && (
          <div className="mt-3 pt-3 border-t border-border/40 space-y-2.5 text-xs text-muted-foreground">
            <p>
              Coverage measures the proportion of technical requirements directly supported by factual GitHub evidence:
            </p>
            <ul className="list-disc pl-5 space-y-1 font-mono text-[11px]">
              <li>
                <strong className="text-emerald-300">PROVEN / VERIFIED MATCH:</strong> 100% weight (1.0)
              </li>
              <li>
                <strong className="text-amber-300">PARTIAL / PARTIAL MATCH:</strong> 50% weight (0.5)
              </li>
              <li>
                <strong className="text-red-300">CLAIMED-ONLY / NOT VERIFIED:</strong> 0% weight (0.0)
              </li>
            </ul>
            <div className="rounded bg-background/60 p-2.5 font-mono text-[11px] space-y-1 border border-border/50">
              <div>
                <strong>Required Coverage</strong> = (Proven × 1.0 + Partial × 0.5) ÷ Total Required Skills × 100
              </div>
              <div>
                <strong>Preferred Coverage</strong> = (Proven × 1.0 + Partial × 0.5) ÷ Total Preferred Skills × 100
              </div>
              <div>
                <strong>Overall Coverage</strong> = Total Evidence Score ÷ Total Extracted Requirements × 100
              </div>
            </div>
            <p className="text-[11px] italic text-muted-foreground/80">
              This score evaluates available development evidence, not candidate worth or hiring eligibility.
            </p>
          </div>
        )}
      </div>

      {/* Mandatory Fairness / Interpretation Notice */}
      <div className="flex gap-3 p-3.5 rounded-xl border border-amber-500/25 bg-amber-500/[0.05] text-xs text-amber-200/90">
        <Info className="size-4 shrink-0 text-amber-400 mt-0.5" />
        <div className="space-y-1">
          <p>
            <strong>Fairness Notice:</strong> SkillProof evaluates available technical evidence. It does not determine whether a candidate is qualified for a job or whether they should be hired.
          </p>
          <p className="text-[11px] text-amber-300/80">
            <strong>Not Verified</strong> means insufficient public GitHub evidence was found, not that the candidate cannot perform the skill.
          </p>
        </div>
      </div>
    </div>
  );
}
