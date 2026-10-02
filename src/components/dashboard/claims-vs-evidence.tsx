"use client";

import { ArrowRight, CheckCircle2, CircleAlert, CircleDashed, FileText, GitCompare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SkillVerificationResult } from "@/lib/evidence";
import type { ResumeClaim, SkillStatus } from "@/types";

interface ClaimsVsEvidenceProps {
  claims: ResumeClaim[];
  verifications: SkillVerificationResult[];
}

const STATUS_BADGE: Record<
  SkillStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  PROVEN: {
    label: "PROVEN",
    icon: CheckCircle2,
    className: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  },
  PARTIAL: {
    label: "PARTIAL",
    icon: CircleAlert,
    className: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  },
  CLAIMED_ONLY: {
    label: "CLAIMED-ONLY",
    icon: CircleDashed,
    className: "border-zinc-700 bg-zinc-800 text-zinc-300",
  },
};

export function ClaimsVsEvidence({ claims, verifications }: ClaimsVsEvidenceProps) {
  // Map verifications by normalized skill name for easy correlation
  const verificationMap = new Map<string, SkillVerificationResult>();
  for (const v of verifications) {
    verificationMap.set(v.skill.toLowerCase(), v);
  }

  return (
    <section aria-label="Claims vs Evidence Pipeline" className="rounded-xl border border-border/80 bg-card/60 p-6 space-y-5">
      <div className="space-y-1 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <GitCompare className="size-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Claims vs Factual Evidence Pipeline
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Visual correlation between unverified resume claims, mined GitHub technical evidence, and deterministic verification results.
        </p>
      </div>

      {/* Header Pipeline Stages */}
      <div className="hidden md:grid grid-cols-12 gap-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 pb-1">
        <div className="col-span-4 flex items-center gap-1.5">
          <FileText className="size-3.5" />
          <span>Resume Skill Claim</span>
        </div>
        <div className="col-span-1 text-center font-mono">→</div>
        <div className="col-span-4 flex items-center gap-1.5">
          <span>GitHub Activity Evidence</span>
        </div>
        <div className="col-span-1 text-center font-mono">→</div>
        <div className="col-span-2 text-right">
          <span>Verification Result</span>
        </div>
      </div>

      {/* List of Claims with pipeline mapping */}
      <div className="divide-y divide-border/50 rounded-lg border border-border/70 overflow-hidden">
        {claims.map((claim) => {
          const matched =
            verificationMap.get(claim.canonicalSkill.toLowerCase()) ||
            verificationMap.get(claim.displayName.toLowerCase());
          const status = matched ? matched.status : "CLAIMED_ONLY";
          const evidenceCount = matched ? matched.evidenceItems.length : 0;
          const repoCount = matched?.repositoryCount ?? 0;
          const badgeMeta = STATUS_BADGE[status];
          const StatusIcon = badgeMeta.icon;

          return (
            <div
              key={claim.id || claim.displayName}
              className="p-3.5 bg-card/40 hover:bg-card/80 transition-colors flex flex-col md:grid md:grid-cols-12 md:items-center gap-3 text-xs"
            >
              {/* 1. Resume Claim */}
              <div className="col-span-4 flex items-center justify-between md:justify-start gap-2">
                <span className="font-semibold text-foreground text-sm">
                  {claim.displayName || claim.canonicalSkill}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded border border-border/80 bg-muted/30 text-muted-foreground">
                  Resume Claim
                </span>
              </div>

              {/* Arrow on desktop */}
              <div className="hidden md:flex col-span-1 justify-center text-muted-foreground/60">
                <ArrowRight className="size-3.5" />
              </div>

              {/* 2. GitHub Evidence */}
              <div className="col-span-4 flex items-center gap-2">
                {evidenceCount > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-medium text-foreground font-mono">
                      {evidenceCount} evidence {evidenceCount === 1 ? "item" : "items"}
                    </span>
                    <span className="text-muted-foreground">
                      across {repoCount} {repoCount === 1 ? "repo" : "repos"}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground font-mono">
                    0 public evidence items
                  </span>
                )}
              </div>

              {/* Arrow on desktop */}
              <div className="hidden md:flex col-span-1 justify-center text-muted-foreground/60">
                <ArrowRight className="size-3.5" />
              </div>

              {/* 3. Verification Result */}
              <div className="col-span-2 flex items-center justify-between md:justify-end gap-2">
                <Badge
                  variant="outline"
                  className={`text-[11px] font-mono px-2 py-0.5 gap-1 shrink-0 ${badgeMeta.className}`}
                >
                  <StatusIcon className="size-3" />
                  {badgeMeta.label}
                </Badge>
                {matched && (
                  <span className="text-xs font-mono font-semibold text-muted-foreground">
                    {matched.evidenceScore}/100
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
