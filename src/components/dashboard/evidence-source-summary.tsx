"use client";

import { useMemo } from "react";
import {
  Box,
  Brush,
  Eye,
  FileCode2,
  FolderGit2,
  GitCommit,
  Layers,
  Network,
  Palette,
  Server,
  Sparkles,
  TestTube2,
  Type,
  Wand2,
  Workflow,
} from "lucide-react";
import type { GitHubEvidenceItem } from "@/types";
import type { BehanceAnalysisResult } from "@/types/behance";

interface EvidenceSourceSummaryProps {
  evidence: GitHubEvidenceItem[];
  repositoryCount: number;
  behanceResult?: BehanceAnalysisResult;
}

const EVIDENCE_TYPE_META: Record<
  string,
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
  // Behance Creative Evidence Types
  behance_project: {
    label: "Behance Projects",
    icon: Layers,
    color: "border-purple-400/30 bg-purple-50 text-purple-700",
  },
  behance_project_category: {
    label: "Categories",
    icon: Eye,
    color: "border-blue-400/30 bg-blue-50 text-blue-700",
  },
  behance_branding: {
    label: "Branding",
    icon: Sparkles,
    color: "border-amber-400/30 bg-amber-50 text-amber-700",
  },
  behance_logo_design: {
    label: "Logo Design",
    icon: Wand2,
    color: "border-emerald-400/30 bg-emerald-50 text-emerald-700",
  },
  behance_graphic_design: {
    label: "Graphic Design",
    icon: Palette,
    color: "border-rose-400/30 bg-rose-50 text-rose-700",
  },
  behance_ui_design: {
    label: "UI Design",
    icon: Layers,
    color: "border-cyan-400/30 bg-cyan-50 text-cyan-700",
  },
  behance_ux_design: {
    label: "UX Design",
    icon: Eye,
    color: "border-indigo-400/30 bg-indigo-50 text-indigo-700",
  },
  behance_typography: {
    label: "Typography",
    icon: Type,
    color: "border-violet-400/30 bg-violet-50 text-violet-700",
  },
  behance_illustration: {
    label: "Illustration",
    icon: Brush,
    color: "border-pink-400/30 bg-pink-50 text-pink-700",
  },
  behance_packaging: {
    label: "Packaging",
    icon: Layers,
    color: "border-orange-400/30 bg-orange-50 text-orange-700",
  },
  behance_motion: {
    label: "Motion",
    icon: Sparkles,
    color: "border-teal-400/30 bg-teal-50 text-teal-700",
  },
  behance_tool_reference: {
    label: "Design Tools",
    icon: Wand2,
    color: "border-slate-400/30 bg-slate-50 text-slate-700",
  },
};

export function EvidenceSourceSummary({ evidence, repositoryCount, behanceResult }: EvidenceSourceSummaryProps) {
  // Aggregate counts by evidence type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of evidence) {
      counts[item.type] = (counts[item.type] || 0) + 1;
    }
    return counts;
  }, [evidence]);

  const activeTypes = Object.entries(typeCounts).filter(([, count]) => (count ?? 0) > 0);

  const githubEvidenceCount = useMemo(() => {
    return evidence.filter((e) => !e.provider || e.provider === "github").length;
  }, [evidence]);

  const behanceEvidenceCount = useMemo(() => {
    return evidence.filter((e) => e.provider === "behance").length;
  }, [evidence]);

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
            Distribution of {evidence.length} factual evidence items across {repositoryCount} GitHub repositories
            {behanceResult ? ` and ${behanceResult.summary.projectsAnalyzed} Behance projects` : ""}.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* GitHub Root Card */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-[#E7DCD1] bg-[#FAF7F2]">
          <div className="p-2 rounded-lg bg-[#F4E2D3] border border-[#E8C5B0] text-[#A95F3D]">
            <FolderGit2 className="size-4" />
          </div>
          <div>
            <p className="text-xs text-[#756B64] font-medium">GitHub ({repositoryCount} repos)</p>
            <p className="text-xl font-extrabold font-mono text-[#241914]">{githubEvidenceCount}</p>
          </div>
        </div>

        {/* Behance Root Card (if available) */}
        {behanceResult && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-purple-300/70 bg-purple-50/50">
            <div className="p-2 rounded-lg bg-purple-100 border border-purple-200 text-purple-700">
              <Palette className="size-4" />
            </div>
            <div>
              <p className="text-xs text-[#756B64] font-medium">Behance ({behanceResult.summary.projectsAnalyzed} projects)</p>
              <p className="text-xl font-extrabold font-mono text-[#241914]">{behanceEvidenceCount}</p>
            </div>
          </div>
        )}

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
