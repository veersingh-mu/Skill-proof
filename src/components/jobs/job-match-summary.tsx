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
        <div className="text-xs text-[#756B64]">
          Evidence evaluated for <strong className="text-[#241914]">{candidateName}</strong> {githubUsername ? `(@${githubUsername})` : ""}.
        </div>
      )}
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Required Coverage */}
        <div className="rounded-2xl border border-[#A95F3D]/25 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#A95F3D] uppercase tracking-wider">
              Required Coverage
            </span>
            <span className="text-xs font-mono text-[#756B64]">
              {requiredCounts.verified}V · {requiredCounts.partial}P · {requiredCounts.notVerified}NV
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-[#241914] font-mono">
              {requiredCoverage}%
            </span>
            <span className="text-xs text-[#756B64]">
              of {requiredCounts.total} required
            </span>
          </div>
          <div className="w-full bg-[#FAF7F2] border border-[#E7DCD1] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#A95F3D] h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, requiredCoverage))}%` }}
            />
          </div>
        </div>

        {/* Preferred Coverage */}
        <div className="rounded-2xl border border-[#E7DCD1] bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#756B64] uppercase tracking-wider">
              Preferred Coverage
            </span>
            <span className="text-xs font-mono text-[#756B64]">
              {preferredCounts.verified}V · {preferredCounts.partial}P · {preferredCounts.notVerified}NV
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-[#241914] font-mono">
              {preferredCoverage}%
            </span>
            <span className="text-xs text-[#756B64]">
              of {preferredCounts.total} preferred
            </span>
          </div>
          <div className="w-full bg-[#FAF7F2] border border-[#E7DCD1] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#6D351F] h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, preferredCoverage))}%` }}
            />
          </div>
        </div>

        {/* Overall Evidence Coverage */}
        <div className="rounded-2xl border border-[#2E8B57]/30 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#2E8B57] uppercase tracking-wider">
              Overall Evidence Coverage
            </span>
            <ShieldCheck className="size-4 text-[#2E8B57]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-[#2E8B57] font-mono">
              {overallCoverage}%
            </span>
            <span className="text-xs text-[#756B64]">
              across {totalRequirements} requirement{totalRequirements === 1 ? "" : "s"}
            </span>
          </div>
          <div className="w-full bg-[#FAF7F2] border border-[#E7DCD1] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#2E8B57] h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, overallCoverage))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Formula & Transparency Toggle */}
      <div className="rounded-xl border border-[#E7DCD1] bg-white p-4 text-xs text-[#756B64] shadow-xs">
        <button
          type="button"
          onClick={() => setShowFormula(!showFormula)}
          className="flex items-center gap-2 text-[#241914] font-bold hover:text-[#A95F3D] transition-colors w-full text-left cursor-pointer"
        >
          <HelpCircle className="size-3.5 text-[#A95F3D]" />
          <span>How this is calculated (Deterministic Evidence Coverage Methodology)</span>
          <span className="ml-auto text-[11px] text-[#756B64] font-mono">
            {showFormula ? "Hide details ▲" : "Show details ▼"}
          </span>
        </button>

        {showFormula && (
          <div className="mt-3 pt-3 border-t border-[#E7DCD1] space-y-2.5 text-xs text-[#756B64]">
            <p>
              Coverage measures the proportion of technical requirements directly supported by factual GitHub evidence:
            </p>
            <ul className="list-disc pl-5 space-y-1 font-mono text-[11px]">
              <li>
                <strong className="text-[#2E8B57]">PROVEN / VERIFIED MATCH:</strong> 100% weight (1.0)
              </li>
              <li>
                <strong className="text-[#D99125]">PARTIAL / PARTIAL MATCH:</strong> 50% weight (0.5)
              </li>
              <li>
                <strong className="text-[#C94A4A]">CLAIMED-ONLY / NOT VERIFIED:</strong> 0% weight (0.0)
              </li>
            </ul>
            <div className="rounded-xl bg-[#FAF7F2] p-3 font-mono text-[11px] space-y-1 border border-[#E7DCD1] text-[#241914]">
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
            <p className="text-[11px] italic text-[#756B64]">
              This score evaluates available development evidence, not candidate worth or hiring eligibility.
            </p>
          </div>
        )}
      </div>

      {/* Mandatory Fairness / Interpretation Notice */}
      <div className="flex gap-3 p-4 rounded-xl border border-[#D99125]/30 bg-[#FFF0D7] text-xs text-[#241914]">
        <Info className="size-4 shrink-0 text-[#D99125] mt-0.5" />
        <div className="space-y-1">
          <p>
            <strong className="text-[#241914]">Fairness Notice:</strong> SkillProof evaluates available technical evidence. It does not determine whether a candidate is qualified for a job or whether they should be hired.
          </p>
          <p className="text-[11px] text-[#756B64]">
            <strong>Not Verified</strong> means insufficient public GitHub evidence was found, not that the candidate cannot perform the skill.
          </p>
        </div>
      </div>
    </div>
  );
}
