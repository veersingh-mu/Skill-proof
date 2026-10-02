"use client";

import Link from "next/link";
import { Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SkillGap } from "@/lib/gaps/types";

interface RemainingGapsProps {
  gaps: SkillGap[];
}

export function RemainingGaps({ gaps }: RemainingGapsProps) {
  if (gaps.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-card/40 p-8 text-center space-y-2">
        <Target className="size-8 text-muted-foreground mx-auto" />
        <p className="text-sm font-semibold text-foreground">No active skill gaps</p>
        <p className="text-xs text-muted-foreground">
          All evaluated requirements have verifiable proof, or run a job analysis to identify role-specific gaps.
        </p>
        <Button asChild size="sm" variant="outline" className="text-xs mt-2">
          <Link href="/jobs">Analyze a Job Description</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card/60 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Target className="size-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-foreground">Remaining Evidence Gaps</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {gaps.length} {gaps.length === 1 ? "gap identified" : "gaps identified"}
        </span>
      </div>

      <div className="space-y-2.5">
        {gaps.map((gap) => (
          <div
            key={gap.skill}
            className="p-3.5 rounded-lg bg-background/50 border border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-foreground text-sm">{gap.skill}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {gap.requirementType}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  gap.priority === "HIGH"
                    ? "bg-red-500/20 text-red-200 border border-red-500/40"
                    : gap.priority === "MEDIUM"
                    ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                    : "bg-blue-500/20 text-blue-200 border border-blue-500/40"
                }`}>
                  {gap.priority} PRIORITY
                </span>
                <span className="text-muted-foreground text-[11px]">
                  Current Status: <strong className="text-foreground">{gap.candidateStatus}</strong> ({gap.verificationScore}/100)
                </span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {gap.explanation}
              </p>
            </div>

            <Button
              asChild
              size="sm"
              className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-semibold text-xs h-8 shrink-0 shadow-sm"
            >
              <Link href={`/tasks?skill=${encodeURIComponent(gap.skill)}`}>
                <Sparkles className="size-3 mr-1.5" />
                Generate Practical Task
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
