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
      <div className="rounded-2xl border border-dashed border-[#E7DCD1] bg-white p-8 text-center space-y-2">
        <Target className="size-8 text-[#756B64] mx-auto" />
        <p className="text-sm font-bold text-[#241914]">No active skill gaps</p>
        <p className="text-xs text-[#756B64]">
          All evaluated requirements have verifiable proof, or run a job analysis to identify role-specific gaps.
        </p>
        <Button asChild size="sm" variant="outline" className="text-xs font-semibold mt-2 border-[#E7DCD1] text-[#241914] hover:bg-[#FAF7F2] rounded-xl">
          <Link href="/jobs">Analyze a Job Description</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E7DCD1] bg-white p-6 sm:p-7 space-y-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-[#E7DCD1] pb-4">
        <div className="flex items-center gap-2">
          <Target className="size-4 text-[#A95F3D]" />
          <h3 className="text-sm font-bold text-[#241914]">Remaining Evidence Gaps</h3>
        </div>
        <span className="text-xs text-[#756B64]">
          {gaps.length} {gaps.length === 1 ? "gap identified" : "gaps identified"}
        </span>
      </div>

      <div className="space-y-3">
        {gaps.map((gap) => (
          <div
            key={gap.skill}
            className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E7DCD1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-[#241914] text-sm">{gap.skill}</span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#F4E2D3] text-[#A95F3D] border border-[#E8C5B0]">
                  {gap.requirementType}
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  gap.priority === "HIGH"
                    ? "bg-[#C94A4A]/10 text-[#C94A4A] border border-[#C94A4A]/30"
                    : gap.priority === "MEDIUM"
                    ? "bg-[#FFF0D7] text-[#D99125] border border-[#D99125]/30"
                    : "bg-[#FAF7F2] text-[#756B64] border border-[#E7DCD1]"
                }`}>
                  {gap.priority} PRIORITY
                </span>
                <span className="text-[#756B64] text-[11px]">
                  Current Status: <strong className="text-[#241914]">{gap.candidateStatus}</strong> ({gap.verificationScore}/100)
                </span>
              </div>
              <p className="text-[#756B64] text-[11px] leading-relaxed">
                {gap.explanation}
              </p>
            </div>

            <Button
              asChild
              size="sm"
              className="bg-[#A95F3D] text-white hover:bg-[#8E4F32] font-bold text-xs h-9 px-4 rounded-xl shrink-0 shadow-xs"
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
