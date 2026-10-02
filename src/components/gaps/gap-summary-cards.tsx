"use client";

import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle, Layers } from "lucide-react";
import type { SkillGapSummary } from "@/lib/gaps/types";

interface GapSummaryCardsProps {
  summary: SkillGapSummary;
}

export function GapSummaryCards({ summary }: GapSummaryCardsProps) {
  const {
    totalRequirements,
    verifiedCount,
    partialCount,
    highPriorityCount,
    lowPriorityCount,
  } = summary;

  return (
    <div className="space-y-4">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        {/* High Priority Evidence Gaps */}
        <div className="rounded-xl border border-red-500/30 bg-gradient-to-b from-red-500/[0.08] to-card/50 p-4 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-300 uppercase tracking-wider">
              High Priority Gaps
            </span>
            <AlertCircle className="size-4 text-red-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-red-300 font-mono">
              {highPriorityCount}
            </span>
            <span className="text-[11px] text-muted-foreground">
              required & unverified
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground/80">
            Mandatory job requirements with zero public evidence.
          </p>
        </div>

        {/* Partial Gaps */}
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-500/[0.08] to-card/50 p-4 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
              Partial Gaps
            </span>
            <AlertTriangle className="size-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-300 font-mono">
              {partialCount}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {summary.requiredPartialGaps} required · {summary.preferredPartialGaps} preferred
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground/80">
            Some evidence exists, but lacks multi-signal depth.
          </p>
        </div>

        {/* Low Priority Evidence Gaps */}
        <div className="rounded-xl border border-blue-500/30 bg-gradient-to-b from-blue-500/[0.08] to-card/50 p-4 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
              Low Priority Gaps
            </span>
            <Layers className="size-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-blue-300 font-mono">
              {lowPriorityCount}
            </span>
            <span className="text-[11px] text-muted-foreground">
              preferred & unverified
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground/80">
            Nice-to-have skills lacking sufficient evidence.
          </p>
        </div>

        {/* Verified Requirements */}
        <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.08] to-card/50 p-4 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
              Verified (No Gap)
            </span>
            <CheckCircle2 className="size-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-300 font-mono">
              {verifiedCount}
            </span>
            <span className="text-[11px] text-muted-foreground">
              of {totalRequirements} requirements
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground/80">
            Fully backed by verified repository development.
          </p>
        </div>
      </div>

      {/* User-facing Explanatory Callout */}
      <div className="flex gap-3 p-3.5 rounded-xl border border-border/80 bg-card/60 text-xs text-muted-foreground">
        <HelpCircle className="size-4 shrink-0 text-emerald-400 mt-0.5" />
        <div className="space-y-1">
          <p className="text-foreground font-semibold">
            What is a Skill Gap in SkillProof?
          </p>
          <p className="leading-relaxed">
            A <strong>skill gap</strong> here means that the current evidence available to SkillProof does not sufficiently verify a job requirement. It does <em>not</em> mean the candidate cannot perform the skill.
          </p>
          <p className="text-[11px] text-muted-foreground/80">
            SkillProof evaluates available technical evidence, not overall employability or human potential.
          </p>
        </div>
      </div>
    </div>
  );
}
