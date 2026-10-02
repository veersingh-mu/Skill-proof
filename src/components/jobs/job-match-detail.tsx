"use client";

import { ExternalLink, FileCode, GitCommit, Package, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GitHubEvidenceItem } from "@/types";

interface JobMatchDetailProps {
  skill: string;
  evidenceItems: GitHubEvidenceItem[];
}

function getEvidenceIcon(type: string) {
  switch (type) {
    case "dependency":
    case "package_manifest":
      return <Package className="size-3.5 text-blue-400" />;
    case "framework":
    case "language":
      return <FileCode className="size-3.5 text-emerald-400" />;
    case "dockerfile":
    case "docker_compose":
      return <Terminal className="size-3.5 text-cyan-400" />;
    case "commit_recency":
      return <GitCommit className="size-3.5 text-amber-400" />;
    default:
      return <FileCode className="size-3.5 text-muted-foreground" />;
  }
}

export function JobMatchDetail({ skill, evidenceItems }: JobMatchDetailProps) {
  if (evidenceItems.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/80 bg-background/50 p-4 text-xs text-muted-foreground">
        No direct repository or package evidence items recorded for {skill}.
      </div>
    );
  }

  return (
    <div className="space-y-2.5 pt-2">
      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        Supporting GitHub Evidence ({evidenceItems.length} item{evidenceItems.length === 1 ? "" : "s"}):
      </div>

      <div className="space-y-2">
        {evidenceItems.map((item, index) => (
          <div
            key={item.id || `${item.repositoryName}-${index}`}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-lg border border-border/60 bg-background/60 text-xs"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                  {getEvidenceIcon(item.type)}
                  {item.repositoryName}
                </span>

                {item.filePath && (
                  <span className="font-mono text-[11px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded border border-border/40">
                    {item.filePath}
                  </span>
                )}

                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-card text-muted-foreground border border-border/40">
                  {item.type.replace(/_/g, " ")}
                </span>
              </div>

              <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                {item.extractedFact}
              </p>
            </div>

            {item.sourceUrl ? (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="text-xs shrink-0 h-7 border-border hover:border-emerald-500/40 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-300 self-start sm:self-auto"
              >
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1"
                >
                  <span>View on GitHub</span>
                  <ExternalLink className="size-3" />
                </a>
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
