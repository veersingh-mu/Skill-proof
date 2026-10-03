"use client";

import { useMemo } from "react";
import {
  Brush,
  Eye,
  Layers,
  Palette,
  Sparkles,
  Type,
  Wand2,
} from "lucide-react";
import type { BehanceAnalysisResult } from "@/types/behance";
import type { GitHubEvidenceItem } from "@/types";

interface BehanceEvidenceViewProps {
  result: BehanceAnalysisResult;
}

const BEHANCE_TYPE_LABELS: Record<string, { label: string; icon: typeof Palette; color: string }> = {
  behance_project: { label: "Projects", icon: Layers, color: "border-purple-400/30 bg-purple-400/10 text-purple-300" },
  behance_project_category: { label: "Categories", icon: Eye, color: "border-blue-400/30 bg-blue-400/10 text-blue-300" },
  behance_branding: { label: "Branding", icon: Sparkles, color: "border-amber-400/30 bg-amber-400/10 text-amber-300" },
  behance_logo_design: { label: "Logo Design", icon: Wand2, color: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" },
  behance_graphic_design: { label: "Graphic Design", icon: Palette, color: "border-rose-400/30 bg-rose-400/10 text-rose-300" },
  behance_ui_design: { label: "UI Design", icon: Layers, color: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300" },
  behance_ux_design: { label: "UX Design", icon: Eye, color: "border-indigo-400/30 bg-indigo-400/10 text-indigo-300" },
  behance_typography: { label: "Typography", icon: Type, color: "border-violet-400/30 bg-violet-400/10 text-violet-300" },
  behance_illustration: { label: "Illustration", icon: Brush, color: "border-pink-400/30 bg-pink-400/10 text-pink-300" },
  behance_packaging: { label: "Packaging", icon: Layers, color: "border-orange-400/30 bg-orange-400/10 text-orange-300" },
  behance_motion: { label: "Motion", icon: Sparkles, color: "border-teal-400/30 bg-teal-400/10 text-teal-300" },
  behance_tool_reference: { label: "Tools", icon: Wand2, color: "border-slate-400/30 bg-slate-400/10 text-slate-300" },
};

export function BehanceEvidenceView({ result }: BehanceEvidenceViewProps) {
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of result.evidence) {
      counts[item.type] = (counts[item.type] || 0) + 1;
    }
    return counts;
  }, [result.evidence]);

  const activeTypes = Object.entries(typeCounts).filter(([, count]) => count > 0);

  return (
    <section className="rounded-xl border border-border bg-card/50 p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold tracking-[0.16em] text-purple-400 uppercase">
              Behance · Creative Evidence
            </p>
          </div>
          <h3 className="mt-1 text-xl font-semibold">Behance Profile Analysis</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {result.summary.evidenceItems} creative evidence items extracted from{" "}
            {result.summary.projectsAnalyzed} public projects for @{result.profile.username}.
          </p>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="flex items-center gap-4 rounded-lg border border-purple-400/20 bg-purple-400/[0.06] p-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-purple-500/20">
          <Palette className="size-5 text-purple-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {result.profile.displayName || result.profile.username}
          </p>
          <p className="text-xs text-muted-foreground">
            {result.profile.projectCount} total projects ·{" "}
            {result.summary.skillHintsDetected.length} creative skill signals detected
          </p>
        </div>
      </div>

      {/* Evidence Type Distribution */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {activeTypes.map(([typeKey, count]) => {
          const meta = BEHANCE_TYPE_LABELS[typeKey] ?? {
            label: typeKey,
            icon: Palette,
            color: "border-slate-400/30 bg-slate-400/10 text-slate-300",
          };
          const Icon = meta.icon;

          return (
            <div
              key={typeKey}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background/60 hover:border-purple-400/30 transition-colors"
            >
              <div className={`p-2 rounded-lg border ${meta.color}`}>
                <Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium truncate max-w-[120px]">
                  {meta.label}
                </p>
                <p className="text-xl font-extrabold font-mono text-foreground">{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Projects List */}
      {result.projects.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Analyzed Projects</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {result.projects.slice(0, 8).map((project) => {
              const projectEvidence = result.evidence.filter(
                (e: GitHubEvidenceItem) => e.repositoryId === project.id
              );
              return (
                <div
                  key={project.id}
                  className="rounded-lg border border-border bg-background/60 p-4 space-y-2 hover:border-purple-400/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-sm font-medium text-foreground line-clamp-1">{project.title}</h5>
                    <span className="rounded bg-purple-400/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-300 shrink-0">
                      {projectEvidence.length} signals
                    </span>
                  </div>
                  {project.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.categories.slice(0, 3).map((cat) => (
                        <span
                          key={cat}
                          className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.description && (
                    <p className="text-xs text-muted-foreground/80 line-clamp-2 italic">
                      &ldquo;{project.description}&rdquo;
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Skill Hints */}
      {result.summary.skillHintsDetected.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Detected Creative Skill Signals</h4>
          <div className="flex flex-wrap gap-2">
            {result.summary.skillHintsDetected.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-purple-400/25 bg-purple-400/10 px-3 py-1 text-xs font-medium text-purple-200"
              >
                {skill}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/70">
            These are observable skill signals — verification status is determined by the Evidence Engine.
          </p>
        </div>
      )}
    </section>
  );
}
