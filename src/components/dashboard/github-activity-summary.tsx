"use client";

import { Activity, Code2, FileCode2, FolderGit2, GitBranch } from "lucide-react";
import type { GitHubAnalysisResult } from "@/types";

interface GitHubActivitySummaryProps {
  result: GitHubAnalysisResult;
}

export function GitHubActivitySummary({ result }: GitHubActivitySummaryProps) {
  const { summary, profile } = result;

  const formattedLastActive = summary.lastActiveDate
    ? (() => {
        try {
          return new Date(summary.lastActiveDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        } catch {
          return summary.lastActiveDate;
        }
      })()
    : "Recent";

  const languagesList = summary.languagesDetected || [];

  return (
    <section aria-label="GitHub Mining Activity" className="rounded-2xl border border-[#E7DCD1] bg-white p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7DCD1] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GitBranch className="size-4 text-[#A95F3D]" />
            <h2 className="text-xs font-bold text-[#241914] uppercase tracking-wider">
              Factual GitHub Activity
            </h2>
          </div>
          <p className="text-xs text-[#756B64]">
            Directly mined technical activity across @{profile.username}&apos;s public repositories.
          </p>
        </div>
        <div className="text-xs text-[#756B64] font-mono">
          Last commit: <span className="text-[#241914] font-bold">{formattedLastActive}</span>
        </div>
      </div>

      {/* Grid of factual metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-[#E7DCD1] bg-[#FAF7F2] p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#756B64]">
            <FolderGit2 className="size-3.5 text-[#A95F3D]" />
            <span>Repositories</span>
          </div>
          <p className="text-2xl font-extrabold font-mono text-[#241914]">
            {summary.repositoriesAnalyzed}
          </p>
          <p className="text-[11px] text-[#756B64]">
            Public repos analyzed
          </p>
        </div>

        <div className="rounded-xl border border-[#E7DCD1] bg-[#FAF7F2] p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#756B64]">
            <Activity className="size-3.5 text-[#A95F3D]" />
            <span>Evidence Items</span>
          </div>
          <p className="text-2xl font-extrabold font-mono text-[#241914]">
            {summary.evidenceItems}
          </p>
          <p className="text-[11px] text-[#756B64]">
            Raw signals extracted
          </p>
        </div>

        <div className="rounded-xl border border-[#E7DCD1] bg-[#FAF7F2] p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#756B64]">
            <Code2 className="size-3.5 text-[#A95F3D]" />
            <span>Languages</span>
          </div>
          <p className="text-2xl font-extrabold font-mono text-[#241914]">
            {languagesList.length}
          </p>
          <p className="text-[11px] text-[#756B64]">
            Detected across repos
          </p>
        </div>

        <div className="rounded-xl border border-[#E7DCD1] bg-[#FAF7F2] p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#756B64]">
            <FileCode2 className="size-3.5 text-[#A95F3D]" />
            <span>Public Repos</span>
          </div>
          <p className="text-2xl font-extrabold font-mono text-[#241914]">
            {profile.publicRepoCount}
          </p>
          <p className="text-[11px] text-[#756B64]">
            GitHub profile total
          </p>
        </div>
      </div>

      {/* Languages detected */}
      {languagesList.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between text-xs text-[#756B64]">
            <span className="font-semibold text-[#241914]">Primary Languages Detected</span>
            <span className="font-mono">{languagesList.length} languages</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {languagesList.map((lang) => (
              <div
                key={lang}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E7DCD1] bg-white text-xs shadow-2xs"
              >
                <Code2 className="size-3 text-[#2E8B57]" />
                <span className="font-bold text-[#241914]">{lang}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
