"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  GitBranch,
  Network,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SkillGap } from "@/lib/gaps/types";
import { JobMatchDetail } from "@/components/jobs/job-match-detail";

interface GapItemCardProps {
  gap: SkillGap;
}

export function GapItemCard({ gap }: GapItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasEvidence = gap.supportingEvidence.length > 0;

  const isVerified = gap.gapType === "NONE";
  const isPartial = gap.gapType === "PARTIAL";

  const isHighPriority = gap.priority === "HIGH";
  const isMediumPriority = gap.priority === "MEDIUM";

  return (
    <div
      className={`rounded-xl border transition-colors p-4 sm:p-5 shadow-sm space-y-3 ${
        isHighPriority
          ? "border-red-500/40 bg-red-500/[0.03] hover:border-red-500/60"
          : isMediumPriority
          ? "border-amber-500/40 bg-amber-500/[0.03] hover:border-amber-500/60"
          : isVerified
          ? "border-emerald-500/30 bg-emerald-500/[0.02] hover:border-emerald-500/50"
          : "border-border/70 bg-card/40 hover:border-border"
      }`}
    >
      {/* Top Row: Skill Name, Badges, Priority, Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-bold text-foreground">
            {gap.skill}
          </span>

          {/* Requirement Type Badge */}
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
              gap.requirementType === "REQUIRED"
                ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                : "bg-blue-500/15 text-blue-300 border border-blue-500/30"
            }`}
          >
            {gap.requirementType}
          </span>

          {/* Gap Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isVerified
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                : isPartial
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                : "bg-red-500/15 text-red-300 border border-red-500/30"
            }`}
          >
            {isVerified ? (
              <>
                <CheckCircle2 className="size-3 text-emerald-400" />
                <span>VERIFIED</span>
              </>
            ) : isPartial ? (
              <>
                <AlertTriangle className="size-3 text-amber-400" />
                <span>PARTIAL GAP</span>
              </>
            ) : (
              <>
                <AlertCircle className="size-3 text-red-400" />
                <span>EVIDENCE GAP</span>
              </>
            )}
          </span>

          {/* Priority Badge (only for gaps) */}
          {!isVerified && (
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
          )}
        </div>

        {/* Verification Score & Repository Count */}
        <div className="flex items-center gap-2 text-xs font-mono self-start sm:self-auto">
          {gap.repositoryCount > 0 && (
            <span className="text-muted-foreground flex items-center gap-1 bg-background/50 px-2 py-0.5 rounded border border-border/40">
              <GitBranch className="size-3 text-emerald-400" />
              {gap.repositoryCount} repo{gap.repositoryCount === 1 ? "" : "s"}
            </span>
          )}

          <span
            className={`px-2 py-0.5 rounded font-bold border ${
              gap.verificationScore >= 80
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : gap.verificationScore > 0
                ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                : "bg-muted/40 text-muted-foreground border-border/40"
            }`}
          >
            Score: {gap.verificationScore}/100
          </span>
        </div>
      </div>

      {/* Explanation text */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        {gap.explanation}
      </p>

      {/* Bottom Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40">
        <div className="flex flex-wrap items-center gap-2">
          {hasEvidence ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs h-8 min-h-[36px] border-border hover:bg-muted text-foreground"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="size-3 mr-1 text-muted-foreground" />
                  Hide Evidence
                </>
              ) : (
                <>
                  <ChevronDown className="size-3 mr-1 text-muted-foreground" />
                  View Evidence ({gap.supportingEvidence.length})
                </>
              )}
            </Button>
          ) : (
            <span className="text-[11px] text-muted-foreground italic">
              No public repository evidence found
            </span>
          )}

          {/* View in Evidence Graph Button */}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs h-8 min-h-[36px] text-muted-foreground hover:text-emerald-300 hover:bg-emerald-500/10"
          >
            <Link href={`/evidence?skill=${encodeURIComponent(gap.skill)}`}>
              <Network className="size-3 mr-1 text-emerald-400" />
              <span>View in Evidence Graph</span>
            </Link>
          </Button>

          {/* Generate Micro-Task Button (for skill gaps only) */}
          {!isVerified && (
            <Button
              asChild
              size="sm"
              className="text-xs h-8 min-h-[36px] bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xs"
            >
              <Link href={`/tasks?skill=${encodeURIComponent(gap.skill)}`}>
                <Sparkles className="size-3 mr-1 text-indigo-200" />
                <span>Generate Practical Task →</span>
              </Link>
            </Button>
          )}
        </div>

        {gap.sourceText && (
          <span className="text-[11px] text-muted-foreground/70 truncate max-w-xs font-mono">
            Source: &quot;{gap.sourceText}&quot;
          </span>
        )}
      </div>

      {/* Expandable Supporting Evidence Detail */}
      {isExpanded && hasEvidence && (
        <JobMatchDetail
          skill={gap.skill}
          evidenceItems={gap.supportingEvidence}
        />
      )}
    </div>
  );
}
