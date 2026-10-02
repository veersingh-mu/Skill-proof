"use client";

import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SkillGap } from "@/lib/gaps/types";

interface GapSelectorProps {
  gaps: SkillGap[];
  selectedGap: SkillGap | null;
  generatingSkill: string | null;
  onSelect: (gap: SkillGap) => void;
}

function GapStatusIcon({ gapType }: { gapType: SkillGap["gapType"] }) {
  if (gapType === "NONE") return <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />;
  if (gapType === "PARTIAL") return <AlertTriangle className="size-4 text-amber-400 shrink-0" />;
  return <AlertCircle className="size-4 text-red-400 shrink-0" />;
}

export function GapSelector({ gaps, selectedGap, generatingSkill, onSelect }: GapSelectorProps) {
  if (gaps.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-card/40 p-8 text-center text-xs text-muted-foreground">
        No skill gaps detected. Run a job description analysis first.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {gaps.map((gap) => {
        const isSelected = selectedGap?.skill === gap.skill;
        const isGenerating = generatingSkill === gap.skill;
        const isHighPriority = gap.priority === "HIGH";
        const isMediumPriority = gap.priority === "MEDIUM";

        return (
          <div
            key={gap.skill}
            onClick={() => onSelect(gap)}
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-4 transition-all cursor-pointer ${
              isSelected
                ? "border-emerald-500/60 bg-emerald-500/[0.08] ring-1 ring-emerald-500/40"
                : isHighPriority
                ? "border-red-500/30 bg-red-500/[0.02] hover:border-red-500/50 hover:bg-red-500/[0.04]"
                : isMediumPriority
                ? "border-amber-500/30 bg-amber-500/[0.02] hover:border-amber-500/50 hover:bg-amber-500/[0.04]"
                : "border-border/60 bg-card/40 hover:border-border hover:bg-card/70"
            }`}
          >
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <GapStatusIcon gapType={gap.gapType} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{gap.skill}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                      gap.requirementType === "REQUIRED"
                        ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                        : "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                    }`}
                  >
                    {gap.requirementType}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isHighPriority
                        ? "bg-red-500/20 text-red-200 border border-red-500/40"
                        : isMediumPriority
                        ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                        : "bg-blue-500/20 text-blue-200 border border-blue-500/40"
                    }`}
                  >
                    {gap.priority} PRIORITY
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{gap.explanation}</p>
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              variant={isSelected ? "default" : "outline"}
              className={`w-full sm:w-auto shrink-0 text-xs h-9 min-h-[38px] ${
                isSelected
                  ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                  : "border-border text-foreground hover:bg-muted"
              }`}
              onClick={() => onSelect(gap)}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : isSelected ? "Selected" : "Generate Task"}
            </Button>
          </div>
        );
      })}
    </div>
  );
}