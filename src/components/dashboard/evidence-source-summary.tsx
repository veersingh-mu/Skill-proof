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
    color: "border-[#A95F3D]/30 bg-[#F4E2D3] text-[#A95F3D]",
  },
  framework: {
    label: "Frameworks",
    icon: Layers,
    color: "border-[#6D351F]/30 bg-[#F7EFE7] text-[#6D351F]",
  },
  repository_language: {
    label: "Languages",
    icon: FileCode2,
    color: "border-[#241914]/20 bg-[#FAF7F2] text-[#241914]",
  },
  dockerfile: {
    label: "Dockerfiles",
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
    label: "CI/CD Workflows",
    icon: Workflow,
    color: "border-[#2E8B57]/30 bg-[#E3F3E8] text-[#2E8B57]",
  },
  test: {
    label: "Test Suites",
    icon: TestTube2,
    color: "border-[#2E8B57]/30 bg-[#E3F3E8] text-[#2E8B57]",
  },
  commit_recency: {
    label: "Commits & Activity",
    icon: GitCommit,
    color: "border-[#A95F3D]/30 bg-[#F4E2D3] text-[#A95F3D]",
  },
  package_manifest: {
    label: "Package Manifests",
    icon: Layers,
    color: "border-[#6D351F]/30 bg-[#F7EFE7] text-[#6D351F]",
  },
  readme: {
    label: "Documentation",
    icon: FileCode2,
    color: "border-[#E7DCD1] bg-white text-[#756B64]",
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
    <section aria-label="Evidence Sources" className="rounded-2xl border border-[#E7DCD1] bg-white p-6 sm:p-7 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-[#E7DCD1] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Network className="size-4 text-[#A95F3D]" />
            <h2 className="text-xs font-bold text-[#241914] uppercase tracking-wider">
              Evidence Sources Breakdown
            </h2>
          </div>
          <p className="text-xs text-[#756B64]">
            Distribution of {evidence.length} factual evidence items across {repositoryCount} public repositories.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Repositories Root Card */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-[#E7DCD1] bg-[#FAF7F2]">
          <div className="p-2 rounded-lg bg-[#F4E2D3] border border-[#E8C5B0] text-[#A95F3D]">
            <FolderGit2 className="size-4" />
          </div>
          <div>
            <p className="text-xs text-[#756B64] font-medium">Repositories</p>
            <p className="text-xl font-extrabold font-mono text-[#241914]">{repositoryCount}</p>
          </div>
        </div>

        {/* Dynamic Active Signal Categories */}
        {activeTypes.map(([typeKey, count]) => {
          const meta = EVIDENCE_TYPE_META[typeKey] ?? {
            label: typeKey,
            icon: FileCode2,
            color: "border-[#E7DCD1] bg-white text-[#756B64]",
          };
          const Icon = meta.icon;

          return (
            <div
              key={typeKey}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-[#E7DCD1] bg-white shadow-2xs hover:border-[#A95F3D]/50 transition-colors"
            >
              <div className={`p-2 rounded-lg border ${meta.color}`}>
                <Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#756B64] font-medium truncate max-w-[120px]">
                  {meta.label}
                </p>
                <p className="text-xl font-extrabold font-mono text-[#241914]">{count}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
