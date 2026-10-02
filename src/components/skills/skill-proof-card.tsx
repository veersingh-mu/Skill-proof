"use client";

import Link from "next/link";
import { ExternalLink, GitBranch, Layers } from "lucide-react";
import { StatusBadge } from "@/components/skills/status-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SkillVerificationResult } from "@/lib/evidence";

interface SkillProofCardProps {
  verification: SkillVerificationResult;
  onViewEvidence?: (skill: string) => void;
  className?: string;
}

export function SkillProofCard({
  verification,
  onViewEvidence,
  className,
}: SkillProofCardProps) {
  const { skill, status, evidenceScore, evidenceItems, repositoryCount } = verification;
  const repos = repositoryCount ?? new Set(evidenceItems.map((e) => e.repositoryName || e.repositoryId || e.sourceUrl)).size;
  const evidenceCount = evidenceItems.length;

  // Determine progress bar color based on status
  const barColor =
    status === "PROVEN"
      ? "bg-emerald-400"
      : status === "PARTIAL"
      ? "bg-amber-400"
      : "bg-zinc-600";

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card/70 p-4 sm:p-5 transition-all duration-200 hover:border-border hover:bg-card/90 hover:shadow-xs",
        status === "PROVEN" && "hover:border-emerald-500/30",
        status === "PARTIAL" && "hover:border-amber-500/30",
        className
      )}
    >
      <div>
        {/* Top: Skill name & Status badge */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold tracking-tight text-foreground group-hover:text-indigo-300 transition-colors">
            {skill}
          </h3>
          <StatusBadge status={status} size="sm" />
        </div>

        {/* Score & Meter */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Evidence Score
            </span>
            <span className="font-mono text-xs font-semibold text-foreground">
              <span className={cn(
                "font-bold",
                status === "PROVEN" ? "text-emerald-400" : status === "PARTIAL" ? "text-amber-400" : "text-zinc-400"
              )}>
                {evidenceScore}
              </span>
              <span className="text-muted-foreground font-normal"> / 100</span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn("h-full transition-all duration-300", barColor)}
              style={{ width: `${Math.max(4, Math.min(100, evidenceScore))}%` }}
            />
          </div>
        </div>

        {/* Metadata: Signals & Repositories */}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground font-mono">
          <div className="flex items-center gap-1.5">
            <Layers className="size-3.5 text-indigo-400" />
            <span>{evidenceCount} {evidenceCount === 1 ? "signal" : "signals"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GitBranch className="size-3.5 text-muted-foreground" />
            <span>{repos} {repos === 1 ? "repo" : "repos"}</span>
          </div>
        </div>
      </div>

      {/* Action: View Evidence */}
      <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between">
        {onViewEvidence ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewEvidence(skill)}
            className="w-full text-xs text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10 h-8 justify-between"
          >
            <span>View Evidence</span>
            <ExternalLink className="size-3" />
          </Button>
        ) : (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full text-xs text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10 h-8 justify-between"
          >
            <Link href={`/portfolio?skill=${encodeURIComponent(skill)}`}>
              <span>View Evidence</span>
              <ExternalLink className="size-3" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
