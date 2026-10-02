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
  { label: string; icon: typeof CheckCircle2; badgeClass: string; borderClass: string }
> = {
  PROVEN: {
    label: "PROVEN",
    icon: CheckCircle2,
    badgeClass: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    borderClass: "border-emerald-500/20 hover:border-emerald-500/40",
  },
  PARTIAL: {
    label: "PARTIAL",
    icon: CircleAlert,
    badgeClass: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    borderClass: "border-amber-500/20 hover:border-amber-500/40",
  },
  CLAIMED_ONLY: {
    label: "CLAIMED-ONLY",
    icon: CircleDashed,
    badgeClass: "border-zinc-700 bg-zinc-800 text-zinc-300",
    borderClass: "border-border/60 hover:border-border",
  },
};

const EVIDENCE_TYPE_META: Record<
  GitHubEvidenceType,
  { label: string; icon: typeof FileCode2; color: string }
> = {
  dependency: {
    label: "Dependency",
    icon: Box,
    color: "border-blue-400/30 bg-blue-400/10 text-blue-300",
  },
  framework: {
    label: "Framework",
    icon: Layers,
    color: "border-indigo-400/30 bg-indigo-400/10 text-indigo-300",
  },
  repository_language: {
    label: "Language",
    icon: FileCode2,
    color: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  },
  dockerfile: {
    label: "Docker",
    icon: Server,
    color: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
  },
  docker_compose: {
    label: "Docker Compose",
    icon: Server,
    color: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
  },
  kubernetes_manifest: {
    label: "Kubernetes",
    icon: Server,
    color: "border-teal-400/30 bg-teal-400/10 text-teal-300",
  },
  cloud_configuration: {
    label: "Cloud / AWS",
    icon: Server,
    color: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  },
  ci_cd: {
    label: "CI/CD",
    icon: Workflow,
    color: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  },
  test: {
    label: "Test Suite",
    icon: TestTube2,
    color: "border-green-400/30 bg-green-400/10 text-green-300",
  },
  commit_recency: {
    label: "Commit",
    icon: GitCommit,
    color: "border-orange-400/30 bg-orange-400/10 text-orange-300",
  },
  package_manifest: {
    label: "Manifest",
    icon: Layers,
    color: "border-purple-400/30 bg-purple-400/10 text-purple-300",
  },
  readme: {
    label: "Documentation",
    icon: FileCode2,
    color: "border-slate-400/30 bg-slate-400/10 text-slate-300",
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
      className={`rounded-xl border bg-card/70 transition-all duration-200 overflow-hidden ${config.borderClass}`}
    >
      {/* Collapsed Header / Summary Row */}
      <div
        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
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
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="outline"
            className={`text-xs font-mono font-semibold px-2.5 py-1 gap-1.5 ${config.badgeClass}`}
          >
            <StatusIcon className="size-3.5" />
            {config.label}
          </Badge>

          <h3 className="text-lg font-bold text-foreground tracking-tight">{skill}</h3>

          <span className="font-mono text-sm font-semibold text-muted-foreground bg-muted/40 px-2 py-0.5 rounded border border-border/60">
            {evidenceScore}/100
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 sm:gap-5">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <FolderGit2 className="size-3.5 text-muted-foreground" />
              {repositoryCount} {repositoryCount === 1 ? "repo" : "repos"}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Box className="size-3.5 text-muted-foreground" />
              {evidenceItems.length} {evidenceItems.length === 1 ? "evidence" : "evidence items"}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="size-9 min-h-[40px] min-w-[40px] p-0 text-muted-foreground hover:text-foreground shrink-0 flex items-center justify-center"
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

      {/* Rationale Snippet Always Visible (Requirement 4) */}
      <div className="px-5 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
        <span className="font-semibold text-foreground">Reason: </span>
        {reason}
      </div>

      {/* Expanded Evidence Trail (Requirement 8) */}
      {isExpanded && (
        <div className="border-t border-border/60 bg-muted/15 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Direct Technical Evidence Trail ({evidenceItems.length})
            </h4>
            {verification.distinctSignalTypes && verification.distinctSignalTypes.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {verification.distinctSignalTypes.map((signal) => (
                  <span
                    key={signal}
                    className="text-[10px] px-2 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono"
                  >
                    {signal}
                  </span>
                ))}
              </div>
            )}
          </div>

          {evidenceItems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/80 p-5 text-center text-xs text-muted-foreground">
              No direct technical evidence items found in analyzed public repositories.
            </div>
          ) : (
            <div className="space-y-2.5">
              {evidenceItems.map((item, index) => {
                const meta = EVIDENCE_TYPE_META[item.type] ?? {
                  label: item.type,
                  icon: FileCode2,
                  color: "border-border bg-muted/40 text-muted-foreground",
                };
                const ItemIcon = meta.icon;

                return (
                  <div
                    key={item.id || `${item.repositoryName}-${index}`}
                    className="rounded-lg border border-border/60 bg-card/90 p-3.5 space-y-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border shrink-0 ${meta.color}`}
                        >
                          <ItemIcon className="size-3" />
                          {meta.label}
                        </span>
                        <span className="font-semibold text-foreground font-mono break-all">
                          {item.repositoryName}
                        </span>
                        {item.filePath && (
                          <span className="text-muted-foreground font-mono text-[11px] break-all">
                            • {item.filePath}
                          </span>
                        )}
                      </div>

                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 hover:underline transition-colors shrink-0"
                        >
                          View on GitHub
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>

                    <p className="text-foreground/90 font-mono text-[11px] leading-relaxed bg-muted/30 p-2 rounded border border-border/40">
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
