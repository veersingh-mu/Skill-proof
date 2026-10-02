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
      <div className="rounded-2xl border border-dashed border-[#E7DCD1] bg-white p-8 text-center text-xs text-[#756B64]">
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
    <div className="rounded-2xl border border-[#E7DCD1] bg-white p-6 space-y-5 shadow-xs animate-in fade-in duration-200">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7DCD1] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-extrabold text-[#241914]">{skill.skill}</h3>
            {skill.status === "PROVEN" && (
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#E3F3E8] text-[#2E8B57] border border-[#2E8B57]/30">
                VERIFIED
              </span>
            )}
            {skill.status === "PARTIAL" && (
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#FFF0D7] text-[#D99125] border border-[#D99125]/30">
                PARTIAL
              </span>
            )}
            {skill.status === "CLAIMED_ONLY" && (
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#FAF7F2] text-[#756B64] border border-[#E7DCD1]">
                INSUFFICIENT
              </span>
            )}
          </div>
          <p className="text-xs text-[#756B64] mt-1">
            {STATUS_DEFINITIONS[skill.status]}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#756B64] block">
              Deterministic Score
            </span>
            <span className="text-xl font-extrabold font-mono text-[#241914]">
              {skill.evidenceScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* 2. Deterministic Explanation */}
      <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E7DCD1] text-xs text-[#756B64] leading-relaxed space-y-1">
        <strong className="text-[#241914] block">Deterministic Verification Reason:</strong>
        <p>{skill.reason}</p>
      </div>

      {/* 3. Evidence Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#A95F3D]">
            Verifiable Technical Evidence ({skill.evidenceCount})
          </h4>
          <span className="text-xs text-[#756B64] font-medium">
            {skill.repositoryCount} {skill.repositoryCount === 1 ? "repository" : "repositories"}
          </span>
        </div>

        {skill.evidenceItems.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-dashed border-[#E7DCD1] text-xs text-[#756B64] text-center">
            The skill is claimed, but there is currently insufficient qualifying evidence in public GitHub repositories.
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from(groupedEvidence.entries()).map(([type, items]) => (
              <div key={type} className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#756B64] flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[#A95F3D]" />
                  {CATEGORY_NAMES[type] || type.replace(/_/g, " ")} ({items.length})
                </div>

                <div className="space-y-2 pl-3 border-l-2 border-[#E7DCD1]">
                  {items.map((ev, i) => (
                    <div
                      key={ev.id || i}
                      className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E7DCD1] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="text-[#241914] font-bold">{ev.extractedFact}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#756B64]">
                          {ev.repositoryName && (
                            <span className="inline-flex items-center gap-1 font-mono">
                              <FolderGit2 className="size-3 text-[#A95F3D]" />
                              {ev.repositoryName}
                            </span>
                          )}
                          {ev.filePath && (
                            <>
                              <span>·</span>
                              <span className="font-mono text-[#756B64]">{ev.filePath}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {ev.sourceUrl && (
                        <a
                          href={ev.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 text-[#A95F3D] hover:text-[#8E4F32] inline-flex items-center gap-1 text-[11px] font-semibold hover:underline"
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
      <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-[#E7DCD1]">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="text-xs font-semibold h-9 border-[#E7DCD1] text-[#241914] hover:bg-[#FAF7F2] rounded-xl"
        >
          <Link href={`/evidence?skill=${encodeURIComponent(skill.skill)}`}>
            <Network className="size-3.5 mr-1.5 text-[#A95F3D]" />
            Explore in Evidence Graph
          </Link>
        </Button>

        {skill.status !== "PROVEN" && (
          <Button
            asChild
            size="sm"
            className="text-xs font-bold h-9 bg-[#A95F3D] text-white hover:bg-[#8E4F32] rounded-xl shadow-xs"
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
