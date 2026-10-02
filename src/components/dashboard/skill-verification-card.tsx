"use client";

import { useState } from "react";
import {
  Box,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  CircleDashed,
  ExternalLink,
  FileCode2,
  FolderGit2,
  GitCommit,
  Layers,
  Server,
  TestTube2,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SkillVerificationResult } from "@/lib/evidence";
import type { GitHubEvidenceType, SkillStatus } from "@/types";

interface SkillVerificationCardProps {
  verification: SkillVerificationResult;
  defaultExpanded?: boolean;
}

const STATUS_CONFIG: Record<
  SkillStatus,
  { label: string; icon: typeof CheckCircle2; badgeClass: string; borderClass: string; barColor: string }
> = {
  PROVEN: {
    label: "VERIFIED",
    icon: CheckCircle2,
    badgeClass: "border-[#2E8B57]/30 bg-[#E3F3E8] text-[#2E8B57]",
    borderClass: "border-[#2E8B57]/30 hover:border-[#2E8B57]",
    barColor: "bg-[#2E8B57]",
  },
  PARTIAL: {
    label: "PARTIAL",
    icon: CircleAlert,
    badgeClass: "border-[#D99125]/30 bg-[#FFF0D7] text-[#D99125]",
    borderClass: "border-[#D99125]/30 hover:border-[#D99125]",
    barColor: "bg-[#D99125]",
  },
  CLAIMED_ONLY: {
    label: "INSUFFICIENT",
    icon: CircleDashed,
    badgeClass: "border-[#E7DCD1] bg-[#FAF7F2] text-[#756B64]",
    borderClass: "border-[#E7DCD1] hover:border-[#A95F3D]/50",
    barColor: "bg-[#E7DCD1]",
  },
};

const EVIDENCE_TYPE_META: Record<
  GitHubEvidenceType,
  { label: string; icon: typeof FileCode2; color: string }
> = {
  dependency: {
    label: "Dependency",
    icon: Box,
    color: "border-[#A95F3D]/30 bg-[#F4E2D3] text-[#A95F3D]",
  },
  framework: {
    label: "Framework",
    icon: Layers,
    color: "border-[#6D351F]/30 bg-[#F7EFE7] text-[#6D351F]",
  },
  repository_language: {
    label: "Language",
    icon: FileCode2,
    color: "border-[#241914]/20 bg-[#FAF7F2] text-[#241914]",
  },
  dockerfile: {
    label: "Docker",
    icon: Server,
    color: "border-[#2E8B57]/30 bg-[#E3F3E8] text-[#2E8B57]",
  },
  docker_compose: {
    label: "Docker Compose",
    icon: Server,
    color: "border-[#2E8B57]/30 bg-[#E3F3E8] text-[#2E8B57]",
  },
  kubernetes_manifest: {
    label: "Kubernetes",
    icon: Server,
    color: "border-[#2E8B57]/30 bg-[#E3F3E8] text-[#2E8B57]",
  },
  cloud_configuration: {
    label: "Cloud Config",
    icon: Server,
    color: "border-[#D99125]/30 bg-[#FFF0D7] text-[#D99125]",
  },
  ci_cd: {
    label: "CI/CD",
    icon: Workflow,
    color: "border-[#2E8B57]/30 bg-[#E3F3E8] text-[#2E8B57]",
  },
  test: {
    label: "Test Suite",
    icon: TestTube2,
    color: "border-[#2E8B57]/30 bg-[#E3F3E8] text-[#2E8B57]",
  },
  commit_recency: {
    label: "Commit",
    icon: GitCommit,
    color: "border-[#A95F3D]/30 bg-[#F4E2D3] text-[#A95F3D]",
  },
  package_manifest: {
    label: "Manifest",
    icon: Layers,
    color: "border-[#6D351F]/30 bg-[#F7EFE7] text-[#6D351F]",
  },
  readme: {
    label: "Documentation",
    icon: FileCode2,
    color: "border-[#E7DCD1] bg-white text-[#756B64]",
  },
};

export function SkillVerificationCard({
  verification,
  defaultExpanded = false,
}: SkillVerificationCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const { skill, status, evidenceScore, reason, evidenceItems, repositoryCount = 0 } = verification;
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;

  return (
    <div
      className={`rounded-2xl border bg-white shadow-xs transition-all duration-200 overflow-hidden ${config.borderClass}`}
    >
      {/* Collapsed Header / Summary Row */}
      <div
        className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2.5">
            <Badge
              variant="outline"
              className={`text-xs font-mono font-bold px-2.5 py-1 gap-1.5 rounded-lg ${config.badgeClass}`}
            >
              <StatusIcon className="size-3.5" />
              {config.label}
            </Badge>

            <h3 className="text-lg font-bold text-[#241914] tracking-tight">{skill}</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#241914] bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#E7DCD1]">
              {evidenceScore} / 100
            </span>
            <div className="w-20 sm:w-24 h-2 rounded-full bg-[#FAF7F2] border border-[#E7DCD1] overflow-hidden">
              <div
                className={`h-full ${config.barColor} transition-all duration-300`}
                style={{ width: `${Math.min(evidenceScore, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 sm:gap-5">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono text-[#756B64]">
            <span className="flex items-center gap-1.5">
              <FolderGit2 className="size-3.5 text-[#A95F3D]" />
              {repositoryCount} {repositoryCount === 1 ? "repo" : "repos"}
            </span>
            <span className="hidden sm:inline text-[#E7DCD1]">•</span>
            <span className="flex items-center gap-1.5">
              <Box className="size-3.5 text-[#A95F3D]" />
              {evidenceItems.length} {evidenceItems.length === 1 ? "evidence signal" : "evidence signals"}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="size-9 min-h-[40px] min-w-[40px] p-0 text-[#756B64] hover:text-[#241914] hover:bg-[#F7EFE7] rounded-xl shrink-0 flex items-center justify-center"
            aria-label={isExpanded ? `Collapse ${skill} evidence details` : `Expand ${skill} evidence details`}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>
      </div>

      {/* Rationale Snippet Always Visible */}
      <div className="px-5 sm:px-6 pb-4 text-xs text-[#756B64] leading-relaxed border-t border-[#E7DCD1]/60 pt-3">
        <strong className="text-[#241914]">Verification Reason: </strong>
        {reason}
      </div>

      {/* Expanded Evidence Trail */}
      {isExpanded && (
        <div className="border-t border-[#E7DCD1] bg-[#FAF7F2]/60 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A95F3D]">
              Direct Technical Evidence Trail ({evidenceItems.length})
            </h4>
            {verification.distinctSignalTypes && verification.distinctSignalTypes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {verification.distinctSignalTypes.map((signal) => (
                  <span
                    key={signal}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white text-[#756B64] border border-[#E7DCD1] font-mono"
                  >
                    {signal}
                  </span>
                ))}
              </div>
            )}
          </div>

          {evidenceItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#E7DCD1] bg-white p-5 text-center text-xs text-[#756B64]">
              No direct technical evidence items found in analyzed public repositories.
            </div>
          ) : (
            <div className="space-y-2.5">
              {evidenceItems.map((item, index) => {
                const meta = EVIDENCE_TYPE_META[item.type] ?? {
                  label: item.type,
                  icon: FileCode2,
                  color: "border-[#E7DCD1] bg-white text-[#756B64]",
                };
                const ItemIcon = meta.icon;

                return (
                  <div
                    key={item.id || `${item.repositoryName}-${index}`}
                    className="rounded-xl border border-[#E7DCD1] bg-white p-4 space-y-2 text-xs shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border shrink-0 ${meta.color}`}
                        >
                          <ItemIcon className="size-3" />
                          {meta.label}
                        </span>
                        <span className="font-bold text-[#241914] font-mono break-all">
                          {item.repositoryName}
                        </span>
                        {item.filePath && (
                          <span className="text-[#756B64] font-mono text-[11px] break-all">
                            • {item.filePath}
                          </span>
                        )}
                      </div>

                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A95F3D] hover:text-[#8E4F32] hover:underline transition-colors shrink-0"
                        >
                          View on GitHub
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>

                    <p className="text-[#241914] font-mono text-[11px] leading-relaxed bg-[#FAF7F2] p-2.5 rounded-lg border border-[#E7DCD1]">
                      {item.extractedFact}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
