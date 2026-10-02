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
    <section aria-label="GitHub Mining Activity" className="rounded-xl border border-border/80 bg-card/60 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GitBranch className="size-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Factual GitHub Activity
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Directly mined technical activity across @{profile.username}&apos;s public repositories.
          </p>
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          Last commit: <span className="text-foreground">{formattedLastActive}</span>
        </div>
      </div>

      {/* Grid of factual metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FolderGit2 className="size-3.5" />
            <span>Repositories</span>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">
            {summary.repositoriesAnalyzed}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Public repos analyzed
          </p>
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Activity className="size-3.5" />
            <span>Evidence Items</span>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">
            {summary.evidenceItems}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Raw signals extracted
          </p>
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Code2 className="size-3.5" />
            <span>Languages</span>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">
            {languagesList.length}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Detected across repos
          </p>
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileCode2 className="size-3.5" />
            <span>Public Repos</span>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">
            {profile.publicRepoCount}
          </p>
          <p className="text-[11px] text-muted-foreground">
            GitHub profile total
          </p>
        </div>
      </div>

      {/* Languages detected */}
      {languagesList.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Primary Languages Detected</span>
            <span className="font-mono">{languagesList.length} languages</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {languagesList.map((lang) => (
              <div
                key={lang}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/70 bg-card/80 text-xs"
              >
                <Code2 className="size-3 text-emerald-400" />
                <span className="font-medium text-foreground">{lang}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
