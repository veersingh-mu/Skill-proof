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
    label: "VERIFIED",
    icon: CheckCircle2,
    className: "border-[#2E8B57]/30 bg-[#E3F3E8] text-[#2E8B57]",
  },
  PARTIAL: {
    label: "PARTIAL",
    icon: CircleAlert,
    className: "border-[#D99125]/30 bg-[#FFF0D7] text-[#D99125]",
  },
  CLAIMED_ONLY: {
    label: "INSUFFICIENT",
    icon: CircleDashed,
    className: "border-[#E7DCD1] bg-[#FAF7F2] text-[#756B64]",
  },
};

export function ClaimsVsEvidence({ claims, verifications }: ClaimsVsEvidenceProps) {
  // Map verifications by normalized skill name for easy correlation
  const verificationMap = new Map<string, SkillVerificationResult>();
  for (const v of verifications) {
    verificationMap.set(v.skill.toLowerCase(), v);
  }

  return (
    <section aria-label="Claims vs Evidence Pipeline" className="rounded-2xl border border-[#E7DCD1] bg-white p-6 sm:p-7 shadow-xs space-y-5">
      <div className="space-y-1 border-b border-[#E7DCD1] pb-4">
        <div className="flex items-center gap-2">
          <GitCompare className="size-4 text-[#A95F3D]" />
          <h2 className="text-xs font-bold text-[#241914] uppercase tracking-wider">
            Claims vs Factual Evidence Pipeline
          </h2>
        </div>
        <p className="text-xs text-[#756B64]">
          Visual correlation between unverified resume claims, mined technical and creative evidence, and deterministic verification results.
        </p>
      </div>

      {/* Header Pipeline Stages */}
      <div className="hidden md:grid grid-cols-12 gap-3 text-xs font-bold text-[#756B64] uppercase tracking-wider px-3 pb-1">
        <div className="col-span-4 flex items-center gap-1.5">
          <FileText className="size-3.5 text-[#A95F3D]" />
          <span>Resume Skill Claim</span>
        </div>
        <div className="col-span-1 text-center font-mono text-[#A95F3D]">→</div>
        <div className="col-span-4 flex items-center gap-1.5">
          <span>Observed Evidence Signals</span>
        </div>
        <div className="col-span-1 text-center font-mono text-[#A95F3D]">→</div>
        <div className="col-span-2 text-right">
          <span>Verification Result</span>
        </div>
      </div>

      {/* List of Claims with pipeline mapping */}
      <div className="divide-y divide-[#E7DCD1] rounded-xl border border-[#E7DCD1] overflow-hidden bg-white">
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
              className="p-3.5 sm:p-4 hover:bg-[#FAF7F2] transition-colors flex flex-col md:grid md:grid-cols-12 md:items-center gap-3 text-xs"
            >
              {/* 1. Resume Claim */}
              <div className="col-span-4 flex items-center justify-between md:justify-start gap-2">
                <span className="font-bold text-[#241914] text-sm">
                  {claim.displayName || claim.canonicalSkill}
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md border border-[#E7DCD1] bg-[#FAF7F2] text-[#756B64]">
                  Resume Claim
                </span>
              </div>

              {/* Arrow on desktop */}
              <div className="hidden md:flex col-span-1 justify-center text-[#A95F3D]">
                <ArrowRight className="size-3.5" />
              </div>

              {/* 2. Mined Evidence */}
              <div className="col-span-4 flex items-center gap-2">
                {evidenceCount > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-[#241914] font-mono">
                      {evidenceCount} evidence {evidenceCount === 1 ? "item" : "items"}
                    </span>
                    <span className="text-[#756B64]">
                      across {repoCount} {repoCount === 1 ? "project/repo" : "projects/repos"}
                    </span>
                  </div>
                ) : (
                  <span className="text-[#756B64] font-mono italic">
                    0 public evidence items
                  </span>
                )}
              </div>

              {/* Arrow on desktop */}
              <div className="hidden md:flex col-span-1 justify-center text-[#A95F3D]">
                <ArrowRight className="size-3.5" />
              </div>

              {/* 3. Verification Result */}
              <div className="col-span-2 flex items-center justify-between md:justify-end gap-2">
                <Badge
                  variant="outline"
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 gap-1 shrink-0 rounded-md ${badgeMeta.className}`}
                >
                  <StatusIcon className="size-3" />
                  {badgeMeta.label}
                </Badge>
                {matched && (
                  <span className="text-xs font-mono font-bold text-[#241914]">
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
