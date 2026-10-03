"use client";

import { useState } from "react";
import {
  Box,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCode2,
  FolderGit2,
  GitCommit,
  GitFork,
  Layers,
  Server,
  Star,
  TestTube2,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GitHubAnalysisResult, GitHubEvidenceType } from "@/types/github";

const EVIDENCE_TYPE_CONFIG: Record<
  string,
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

export function GitHubEvidenceView({ result }: { result: GitHubAnalysisResult }) {
  const [filterType, setFilterType] = useState<string>("all");

  const filteredEvidence =
    filterType === "all"
      ? result.evidence
      : result.evidence.filter((item) => item.type === filterType);

  const evidenceTypes = Array.from(new Set(result.evidence.map((e) => e.type)));

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* 1. GitHub Profile Section */}
      <section className="rounded-xl border border-border bg-card/50 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            {result.profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={result.profile.avatarUrl}
                alt={result.profile.username}
                className="size-14 rounded-full border border-border bg-muted object-cover"
              />
            ) : (
              <div className="grid size-14 place-items-center rounded-full bg-muted font-bold text-lg">
                {result.profile.username[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-xl font-bold text-foreground">
                  {result.profile.name || result.profile.username}
                </h3>
                <span className="font-mono text-xs text-muted-foreground">@{result.profile.username}</span>
              </div>
              {result.profile.bio && (
                <p className="mt-1 text-sm text-muted-foreground max-w-xl">{result.profile.bio}</p>
              )}
            </div>
          </div>

          <Button variant="outline" size="sm" asChild>
            <a
              href={result.profile.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              Open GitHub Profile <ExternalLink className="size-3.5" />
            </a>
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-border/80 bg-background/50 p-3">
            <span className="text-xs text-muted-foreground">Public Repos</span>
            <p className="mt-1 font-mono text-lg font-semibold">{result.profile.publicRepoCount}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/50 p-3">
            <span className="text-xs text-muted-foreground">Repositories Analyzed</span>
            <p className="mt-1 font-mono text-lg font-semibold text-emerald-400">
              {result.summary.repositoriesAnalyzed}
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/50 p-3">
            <span className="text-xs text-muted-foreground">Evidence Items Mined</span>
            <p className="mt-1 font-mono text-lg font-semibold text-cyan-400">
              {result.summary.evidenceItems}
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/50 p-3">
            <span className="text-xs text-muted-foreground">Followers</span>
            <p className="mt-1 font-mono text-lg font-semibold">{result.profile.followers}</p>
          </div>
        </div>
      </section>

      {/* 2. Repositories Analyzed */}
      <section className="rounded-xl border border-border bg-card/50 p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="font-semibold text-lg text-foreground">Repositories Analyzed</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Prioritized non-forked, non-archived repositories with recent activity.
            </p>
          </div>
          <span className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
            {result.repositories.length} repos
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {result.repositories.map((repo) => (
            <div
              key={repo.id}
              className="flex flex-col justify-between rounded-lg border border-border/80 bg-background/60 p-4 transition-colors hover:border-border"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground hover:text-emerald-300 transition-colors inline-flex items-center gap-1.5"
                  >
                    <FolderGit2 className="size-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{repo.name}</span>
                    <ExternalLink className="size-3 text-muted-foreground shrink-0" />
                  </a>
                  {repo.language && (
                    <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground shrink-0">
                      {repo.language}
                    </span>
                  )}
                </div>
                {repo.description && (
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{repo.description}</p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <Star className="size-3" /> {repo.stargazersCount}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <GitFork className="size-3" /> {repo.forksCount}
                  </span>
                </div>
                <span className="text-[11px]">
                  Active: {repo.pushedAt ? repo.pushedAt.slice(0, 10) : "N/A"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Factual Evidence Found */}
      <section className="rounded-xl border border-border bg-card/50 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold tracking-[0.16em] text-emerald-300 uppercase">
                Technical Evidence
              </p>
              <Badge variant="outline" className="border-cyan-400/25 bg-cyan-400/10 text-cyan-300 text-[11px]">
                Evidence detected
              </Badge>
            </div>
            <h3 className="mt-1 text-xl font-semibold">Factual Evidence Found</h3>
            <p className="mt-1.5 text-xs text-muted-foreground">
              These are factual observations directly backed by public GitHub files, manifests, and commits.
            </p>
          </div>

          <div className="rounded-lg border border-amber-400/20 bg-amber-400/[0.06] p-3 text-xs text-amber-200/90 max-w-sm">
            <span className="font-semibold block text-amber-100 mb-0.5">Important Phase Rule:</span>
            Status is <strong>&ldquo;Evidence detected&rdquo;</strong>. Proven / Partial / Claimed-only scoring
            will be executed deterministically in Phase 4.
          </div>
        </div>

        {/* Filter Chips */}
        <div className="mt-5 flex flex-wrap gap-1.5 pb-2">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              filterType === "all"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All Evidence ({result.evidence.length})
          </button>
          {evidenceTypes.map((type) => {
            const conf = EVIDENCE_TYPE_CONFIG[type as GitHubEvidenceType];
            const count = result.evidence.filter((e) => e.type === type).length;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  filterType === type
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {conf ? conf.label : type} ({count})
              </button>
            );
          })}
        </div>

        {/* Evidence List */}
        <div className="mt-5 space-y-3">
          {filteredEvidence.map((item) => {
            const config = EVIDENCE_TYPE_CONFIG[item.type] ?? {
              label: item.type,
              icon: FileCode2,
              color: "border-border bg-muted text-foreground",
            };
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-lg border border-border bg-background/70 p-4 transition-colors hover:border-border/80"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
                      <Icon className="size-3.5" />
                      {config.label}
                    </span>
                    {item.repositoryName && (
                      <span className="font-mono text-xs text-muted-foreground">
                        repo: <strong className="text-foreground">{item.repositoryName}</strong>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.commitSha ? (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted hover:text-emerald-300 transition-colors"
                      >
                        <GitCommit className="size-3" /> View Commit <ExternalLink className="size-3 ml-0.5" />
                      </a>
                    ) : item.filePath ? (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted hover:text-emerald-300 transition-colors"
                      >
                        <FileCode2 className="size-3" /> View File <ExternalLink className="size-3 ml-0.5" />
                      </a>
                    ) : (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted hover:text-emerald-300 transition-colors"
                      >
                        <FolderGit2 className="size-3" /> Open Repository <ExternalLink className="size-3 ml-0.5" />
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-sm text-foreground/90 font-medium">{item.extractedFact}</p>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {item.filePath && (
                    <span className="font-mono text-[11px] text-muted-foreground">
                      File: {item.filePath}
                    </span>
                  )}
                  {item.skillHints.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-[11px]">Skill Hints:</span>
                      {item.skillHints.map((hint) => (
                        <span
                          key={hint}
                          className="rounded bg-muted/80 px-1.5 py-0.2 font-mono text-[10px] text-foreground"
                        >
                          {hint}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredEvidence.length === 0 && (
            <p className="text-center py-6 text-sm text-muted-foreground">
              No evidence items matched this filter.
            </p>
          )}
        </div>
      </section>

      {/* 4. Phase 4 Readiness Banner */}
      <section className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-6 text-sm text-emerald-100 flex items-start gap-3">
        <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-emerald-200">Phase 3 Complete: Real GitHub Evidence Collected</h4>
          <p className="mt-1 text-xs text-emerald-200/80 leading-relaxed">
            {result.summary.evidenceItems} factual evidence items mined from {result.summary.repositoriesAnalyzed} public
            repositories. These verified data points are now ready for the deterministic evidence engine in Phase 4.
          </p>
        </div>
      </section>
    </div>
  );
}
