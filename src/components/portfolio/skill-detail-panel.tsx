"use client";

import Link from "next/link";
import {
  ExternalLink,
  FolderGit2,
  Network,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SkillPortfolioItem } from "@/lib/portfolio/types";
import type { GitHubEvidenceItem, SkillStatus } from "@/types";

interface SkillDetailPanelProps {
  skill: SkillPortfolioItem | null;
}

const STATUS_DEFINITIONS: Record<SkillStatus, string> = {
  PROVEN: "Strong technical evidence satisfies the verification criteria.",
  PARTIAL: "Some technical evidence exists, but the verification threshold has not been met.",
  CLAIMED_ONLY: "The skill is claimed, but there is currently insufficient qualifying evidence.",
};

const CATEGORY_NAMES: Record<string, string> = {
  repository_language: "Languages & Core Code",
  dependency: "Package Dependencies",
  framework: "Frameworks & Runtimes",
  dockerfile: "Docker & Containerization",
  docker_compose: "Docker Compose",
  kubernetes_manifest: "Kubernetes Manifests",
  cloud_configuration: "Cloud Infrastructure",
  ci_cd: "CI/CD & Workflows",
  test: "Automated Tests",
  package_manifest: "Package Manifests",
  readme: "Documentation & README",
  commit_recency: "Commit Activity",
};

export function SkillDetailPanel({ skill }: SkillDetailPanelProps) {
  if (!skill) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-card/40 p-8 text-center text-xs text-muted-foreground">
        Select a skill from the matrix to inspect its factual evidence and verification history.
      </div>
    );
  }

  // Group evidence by category
  const groupedEvidence = new Map<string, GitHubEvidenceItem[]>();
  for (const item of skill.evidenceItems) {
    const category = item.type;
    const list = groupedEvidence.get(category) || [];
    list.push(item);
    groupedEvidence.set(category, list);
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card/60 p-5 space-y-5 animate-in fade-in duration-200">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-foreground">{skill.skill}</h3>
            {skill.status === "PROVEN" && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                PROVEN
              </span>
            )}
            {skill.status === "PARTIAL" && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                PARTIAL
              </span>
            )}
            {skill.status === "CLAIMED_ONLY" && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-500/15 text-red-300 border border-red-500/30">
                CLAIMED ONLY
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {STATUS_DEFINITIONS[skill.status]}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
              Deterministic Score
            </span>
            <span className="text-lg font-bold font-mono text-foreground">
              {skill.evidenceScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* 2. Deterministic Explanation */}
      <div className="p-3.5 rounded-lg bg-background/50 border border-border/40 text-xs text-muted-foreground leading-relaxed space-y-1">
        <strong className="text-foreground block">Deterministic Verification Reason:</strong>
        <p>{skill.reason}</p>
      </div>

      {/* 3. Evidence Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Verifiable Technical Evidence ({skill.evidenceCount})
          </h4>
          <span className="text-[11px] text-muted-foreground">
            {skill.repositoryCount} {skill.repositoryCount === 1 ? "repository" : "repositories"}
          </span>
        </div>

        {skill.evidenceItems.length === 0 ? (
          <div className="p-4 rounded-lg bg-background/40 border border-dashed border-border/60 text-xs text-muted-foreground text-center">
            The skill is claimed, but there is currently insufficient qualifying evidence in public GitHub repositories.
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from(groupedEvidence.entries()).map(([type, items]) => (
              <div key={type} className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  {CATEGORY_NAMES[type] || type.replace(/_/g, " ")} ({items.length})
                </div>

                <div className="space-y-1.5 pl-2.5 border-l-2 border-border/60">
                  {items.map((ev, i) => (
                    <div
                      key={ev.id || i}
                      className="p-2.5 rounded-lg bg-background/60 border border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="text-foreground/90 font-medium">{ev.extractedFact}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          {ev.repositoryName && (
                            <span className="inline-flex items-center gap-1">
                              <FolderGit2 className="size-3 text-muted-foreground" />
                              {ev.repositoryName}
                            </span>
                          )}
                          {ev.filePath && (
                            <>
                              <span>·</span>
                              <span className="font-mono text-muted-foreground">{ev.filePath}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {ev.sourceUrl && (
                        <a
                          href={ev.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 text-[11px] font-medium hover:underline"
                        >
                          Open on GitHub
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-border/40">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="text-xs h-8 border-border hover:bg-muted"
        >
          <Link href={`/evidence?skill=${encodeURIComponent(skill.skill)}`}>
            <Network className="size-3.5 mr-1.5 text-emerald-400" />
            Explore in Evidence Graph
          </Link>
        </Button>

        {skill.status !== "PROVEN" && (
          <Button
            asChild
            size="sm"
            className="text-xs h-8 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-semibold"
          >
            <Link href={`/tasks?skill=${encodeURIComponent(skill.skill)}`}>
              <Sparkles className="size-3.5 mr-1.5" />
              Generate Practical Task
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
