"use client";

import { useMemo } from "react";
import {
  Box,
  FileCode2,
  FolderGit2,
  GitCommit,
  Layers,
  Network,
  Server,
  TestTube2,
  Workflow,
} from "lucide-react";
import type { GitHubEvidenceItem, GitHubEvidenceType } from "@/types";

interface EvidenceSourceSummaryProps {
  evidence: GitHubEvidenceItem[];
  repositoryCount: number;
}

const EVIDENCE_TYPE_META: Record<
  GitHubEvidenceType,
  { label: string; icon: typeof FileCode2; color: string }
> = {
  dependency: {
    label: "Dependencies",
    icon: Box,
    color: "border-blue-400/30 bg-blue-400/10 text-blue-300",
  },
  framework: {
    label: "Frameworks",
    icon: Layers,
    color: "border-indigo-400/30 bg-indigo-400/10 text-indigo-300",
  },
  repository_language: {
    label: "Languages",
    icon: FileCode2,
    color: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  },
  dockerfile: {
    label: "Dockerfiles",
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
    label: "CI/CD Workflows",
    icon: Workflow,
    color: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  },
  test: {
    label: "Test Suites",
    icon: TestTube2,
    color: "border-green-400/30 bg-green-400/10 text-green-300",
  },
  commit_recency: {
    label: "Commits & Activity",
    icon: GitCommit,
    color: "border-orange-400/30 bg-orange-400/10 text-orange-300",
  },
  package_manifest: {
    label: "Package Manifests",
    icon: Layers,
    color: "border-purple-400/30 bg-purple-400/10 text-purple-300",
  },
  readme: {
    label: "Documentation (README)",
    icon: FileCode2,
    color: "border-slate-400/30 bg-slate-400/10 text-slate-300",
  },
};

export function EvidenceSourceSummary({ evidence, repositoryCount }: EvidenceSourceSummaryProps) {
  // Aggregate counts by evidence type
  const typeCounts = useMemo(() => {
    const counts: Partial<Record<GitHubEvidenceType, number>> = {};
    for (const item of evidence) {
      counts[item.type] = (counts[item.type] || 0) + 1;
    }
    return counts;
  }, [evidence]);

  const activeTypes = Object.entries(typeCounts).filter(([, count]) => (count ?? 0) > 0) as [
    GitHubEvidenceType,
    number,
  ][];

  return (
    <section aria-label="Evidence Sources" className="rounded-xl border border-border/80 bg-card/60 p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Network className="size-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Evidence Sources Breakdown
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Distribution of {evidence.length} factual evidence items across {repositoryCount} public repositories.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Repositories Root Card */}
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border/70 bg-muted/20">
          <div className="p-2 rounded-md bg-muted/50 border border-border/50 text-muted-foreground">
            <FolderGit2 className="size-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Repositories</p>
            <p className="text-lg font-bold font-mono text-foreground">{repositoryCount}</p>
          </div>
        </div>

        {/* Dynamic Active Signal Categories */}
        {activeTypes.map(([typeKey, count]) => {
          const meta = EVIDENCE_TYPE_META[typeKey] ?? {
            label: typeKey,
            icon: FileCode2,
            color: "border-border bg-muted/40 text-muted-foreground",
          };
          const Icon = meta.icon;

          return (
            <div
              key={typeKey}
              className="flex items-center gap-3 p-3 rounded-lg border border-border/70 bg-card/80"
            >
              <div className={`p-2 rounded-md border ${meta.color}`}>
                <Icon className="size-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium truncate max-w-[120px]">
                  {meta.label}
                </p>
                <p className="text-lg font-bold font-mono text-foreground">{count}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
