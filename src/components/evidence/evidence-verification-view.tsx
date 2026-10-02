"use client";

import { useMemo, useState } from "react";
import {
  Box,
  ChevronDown,
  ChevronUp,
  Clock,
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
import type { EvidenceEngineResult } from "@/lib/evidence";
import type { GitHubEvidenceType, SkillStatus } from "@/types";

const EVIDENCE_TYPE_ICONS: Record<
  GitHubEvidenceType,
  { label: string; icon: typeof FileCode2; color: string }
> = {
  repository_language: {
    label: "Language",
    icon: FileCode2,
    color: "border-sky-400/25 bg-sky-400/10 text-sky-300",
  },
  readme: {
    label: "Documentation",
    icon: FileCode2,
    color: "border-slate-400/25 bg-slate-400/10 text-slate-300",
  },
  package_manifest: {
    label: "Manifest",
    icon: Layers,
    color: "border-purple-400/25 bg-purple-400/10 text-purple-300",
  },
  dependency: {
    label: "Dependency",
    icon: Box,
    color: "border-blue-400/25 bg-blue-400/10 text-blue-300",
  },
  framework: {
    label: "Framework",
    icon: Layers,
    color: "border-indigo-400/25 bg-indigo-400/10 text-indigo-300",
  },
  dockerfile: {
    label: "Docker",
    icon: Server,
    color: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
  },
  docker_compose: {
    label: "Docker Compose",
    icon: Server,
    color: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
  },
  kubernetes_manifest: {
    label: "Kubernetes",
    icon: Server,
    color: "border-blue-400/25 bg-blue-400/10 text-blue-300",
  },
  cloud_configuration: {
    label: "Cloud / AWS",
    icon: Server,
    color: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  },
  ci_cd: {
    label: "CI/CD",
    icon: Workflow,
    color: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  },
  test: {
    label: "Automated Tests",
    icon: TestTube2,
    color: "border-teal-400/25 bg-teal-400/10 text-teal-300",
  },
  commit_recency: {
    label: "Commit Recency",
    icon: Clock,
    color: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  },
};

function StatusBadge({ status }: { status: SkillStatus }) {
  if (status === "PROVEN") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-400/30 bg-emerald-400/10 text-emerald-300 font-semibold px-2.5 py-0.5 text-xs flex items-center gap-1.5"
      >
        <span className="size-2 rounded-full bg-emerald-400" />
        PROVEN
      </Badge>
    );
  }

  if (status === "PARTIAL") {
    return (
      <Badge
        variant="outline"
        className="border-amber-400/30 bg-amber-400/10 text-amber-300 font-semibold px-2.5 py-0.5 text-xs flex items-center gap-1.5"
      >
        <span className="size-2 rounded-full bg-amber-400" />
        PARTIAL
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-rose-400/30 bg-rose-400/10 text-rose-300 font-semibold px-2.5 py-0.5 text-xs flex items-center gap-1.5"
    >
      <span className="size-2 rounded-full bg-rose-400" />
      CLAIMED-ONLY
    </Badge>
  );
}

function ScoreProgressBar({ score, status }: { score: number; status: SkillStatus }) {
  const barColor =
    status === "PROVEN"
      ? "bg-emerald-500"
      : status === "PARTIAL"
      ? "bg-amber-400"
      : "bg-muted-foreground/40";

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-28 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.max(score, 4)}%` }}
        />
      </div>
      <span className="font-mono text-xs font-semibold text-foreground">{score}/100</span>
    </div>
  );
}

export function EvidenceVerificationView({ evaluation }: { evaluation: EvidenceEngineResult }) {
  const [filter, setFilter] = useState<"ALL" | SkillStatus>("ALL");
  const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>({});

  const toggleExpand = (skill: string) => {
    setExpandedSkills((prev) => ({ ...prev, [skill]: !prev[skill] }));
  };

  const filteredVerifications = useMemo(() => {
    if (filter === "ALL") return evaluation.verifications;
    return evaluation.verifications.filter((v) => v.status === filter);
  }, [evaluation.verifications, filter]);

  const { totalClaims, provenCount, partialCount, claimedOnlyCount, averageScore } =
    evaluation.summary;

  return (
    <section className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header Banner */}
      <div className="rounded-xl border border-border bg-card/60 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold tracking-[0.16em] text-emerald-300 uppercase">
                Phase 4 — Evidence Verification
              </p>
              <Badge variant="outline" className="border-indigo-400/25 bg-indigo-400/10 text-indigo-300 text-[10px]">
                Deterministic Engine
              </Badge>
            </div>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              Skill Verification Results
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Convert factual GitHub evidence into explainable, traceable skill verification.
            </p>
          </div>

          <div className="rounded-lg border border-border/80 bg-background/50 px-4 py-2.5 text-right">
            <span className="text-[11px] text-muted-foreground block">Average Verification Score</span>
            <span className="font-mono text-xl font-bold text-foreground">{averageScore}/100</span>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border/80 bg-background/50 p-4">
            <span className="text-xs text-muted-foreground">Total Claims</span>
            <p className="mt-1 font-mono text-2xl font-bold text-foreground">{totalClaims}</p>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">From confirmed resume</span>
          </div>

          <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.05] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-300/80 font-medium">Proven</span>
              <span className="size-2 rounded-full bg-emerald-400" />
            </div>
            <p className="mt-1 font-mono text-2xl font-bold text-emerald-400">{provenCount}</p>
            <span className="text-[11px] text-emerald-200/70 mt-0.5 block">Direct multi-signal proof</span>
          </div>

          <div className="rounded-lg border border-amber-400/20 bg-amber-400/[0.05] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-300/80 font-medium">Partial</span>
              <span className="size-2 rounded-full bg-amber-400" />
            </div>
            <p className="mt-1 font-mono text-2xl font-bold text-amber-400">{partialCount}</p>
            <span className="text-[11px] text-amber-200/70 mt-0.5 block">Limited or single signal</span>
          </div>

          <div className="rounded-lg border border-rose-400/20 bg-rose-400/[0.05] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-rose-300/80 font-medium">Claimed-Only</span>
              <span className="size-2 rounded-full bg-rose-400" />
            </div>
            <p className="mt-1 font-mono text-2xl font-bold text-rose-400">{claimedOnlyCount}</p>
            <span className="text-[11px] text-rose-200/70 mt-0.5 block">No public GitHub evidence</span>
          </div>
        </div>

        {/* Explainability / Safety Notice */}
        <div className="mt-6 rounded-lg border border-border/80 bg-background/40 p-4 text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Deterministic Evaluation Policy:</strong> Skills are marked{" "}
          <strong className="text-emerald-300">PROVEN</strong> only when backed by direct technical implementation
          (source code, dependencies, frameworks, tests, or container manifests) across verified repositories.
          README documentation mentions and commit counts alone never prove a skill.{" "}
          <strong className="text-rose-300">CLAIMED-ONLY</strong> reflects absence of public GitHub evidence, not
          candidate inability. No AI is used in scoring.
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
            filter === "ALL"
              ? "bg-foreground text-background"
              : "bg-card border border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          All Skills ({totalClaims})
        </button>
        <button
          type="button"
          onClick={() => setFilter("PROVEN")}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors inline-flex items-center gap-1.5 ${
            filter === "PROVEN"
              ? "bg-emerald-600 text-white"
              : "bg-card border border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          <span className="size-2 rounded-full bg-emerald-400" />
          Proven ({provenCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter("PARTIAL")}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors inline-flex items-center gap-1.5 ${
            filter === "PARTIAL"
              ? "bg-amber-600 text-white"
              : "bg-card border border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          <span className="size-2 rounded-full bg-amber-400" />
          Partial ({partialCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter("CLAIMED_ONLY")}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors inline-flex items-center gap-1.5 ${
            filter === "CLAIMED_ONLY"
              ? "bg-rose-700 text-white"
              : "bg-card border border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          <span className="size-2 rounded-full bg-rose-400" />
          Claimed-Only ({claimedOnlyCount})
        </button>
      </div>

      {/* Verification Cards List */}
      <div className="space-y-4">
        {filteredVerifications.map((item) => {
          const isExpanded = Boolean(expandedSkills[item.skill]);
          const hasEvidence = item.evidenceItems.length > 0;

          return (
            <div
              key={item.skill}
              className="rounded-xl border border-border bg-card/60 p-5 sm:p-6 transition-colors hover:border-border/90"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-bold text-foreground">{item.skill}</h4>
                  <StatusBadge status={item.status} />
                </div>

                <div className="flex items-center gap-4">
                  <ScoreProgressBar score={item.evidenceScore} status={item.status} />
                </div>
              </div>

              {/* Explainable Reason */}
              <div className="mt-3 rounded-lg border border-border/60 bg-background/50 p-3.5 text-sm text-foreground/90 leading-relaxed">
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider block mb-1">
                  Verification Rationale:
                </span>
                {item.reason}
              </div>

              {/* Evidence Expand Trigger & Details */}
              <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>
                    Repositories:{" "}
                    <strong className="text-foreground">{item.repositoryCount ?? 0}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Factual items:{" "}
                    <strong className="text-foreground">{item.evidenceItems.length}</strong>
                  </span>
                </div>

                {hasEvidence ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(item.skill)}
                    className="h-8 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
                  >
                    {isExpanded ? (
                      <>
                        Hide Evidence <ChevronUp className="size-3.5" />
                      </>
                    ) : (
                      <>
                        View Evidence ({item.evidenceItems.length}) <ChevronDown className="size-3.5" />
                      </>
                    )}
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground italic">
                    No matching GitHub artifacts
                  </span>
                )}
              </div>

              {/* Traceable Evidence Items Breakdown */}
              {isExpanded && hasEvidence && (
                <div className="mt-4 space-y-2.5 pt-3 border-t border-border/40 animate-in fade-in-50 duration-300">
                  <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase block mb-2">
                    Direct Traceable Evidence for {item.skill}:
                  </span>

                  {item.evidenceItems.map((evidence) => {
                    const iconConfig = EVIDENCE_TYPE_ICONS[evidence.type] || {
                      label: evidence.type,
                      icon: FileCode2,
                      color: "border-border bg-muted text-foreground",
                    };
                    const Icon = iconConfig.icon;

                    return (
                      <div
                        key={evidence.id}
                        className="flex flex-col gap-2 rounded-lg border border-border/80 bg-background/80 p-3.5 text-xs transition-colors hover:border-border"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${iconConfig.color}`}
                            >
                              <Icon className="size-3" />
                              {iconConfig.label}
                            </span>
                            {evidence.repositoryName && (
                              <span className="font-mono text-[11px] text-muted-foreground">
                                repo: <strong className="text-foreground">{evidence.repositoryName}</strong>
                              </span>
                            )}
                          </div>

                          <a
                            href={evidence.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
                          >
                            {evidence.commitSha ? (
                              <>
                                View Commit <GitCommit className="size-3" />
                              </>
                            ) : evidence.filePath ? (
                              <>
                                View File <FileCode2 className="size-3" />
                              </>
                            ) : (
                              <>
                                View Repo <FolderGit2 className="size-3" />
                              </>
                            )}
                            <ExternalLink className="size-3 ml-0.5" />
                          </a>
                        </div>

                        <p className="text-foreground/90 font-medium text-xs">
                          {evidence.extractedFact}
                        </p>

                        {evidence.filePath && (
                          <div className="text-[11px] font-mono text-muted-foreground">
                            Path: {evidence.filePath}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredVerifications.length === 0 && (
          <div className="rounded-xl border border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
            No skills match this filter.
          </div>
        )}
      </div>
    </section>
  );
}
