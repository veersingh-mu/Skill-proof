"use client";

import {
  CircleDashed,
  ExternalLink,
  FolderGit2,
  Info,
  UserCheck,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EvidenceNodePayload } from "@/lib/evidence/graph";

interface NodeDetailPanelProps {
  data: EvidenceNodePayload | null;
  onClose: () => void;
}

export function NodeDetailPanel({ data, onClose }: NodeDetailPanelProps) {
  if (!data) return null;

  return (
    <div className="rounded-xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-md text-xs space-y-3 max-w-sm w-full max-h-[75vh] overflow-y-auto animate-in fade-in-50 zoom-in-95">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
          <Info className="size-3.5 text-emerald-400" />
          <span>Node Details • {data.type}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="size-8 p-1 text-muted-foreground hover:text-foreground rounded-full min-h-[36px] min-w-[36px] flex items-center justify-center"
          aria-label="Close detail panel"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* 1. Skill Node Detail */}
      {data.type === "skill" && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-foreground">{data.skill}</h4>
            <Badge
              variant="outline"
              className={`text-xs font-mono font-bold ${
                data.status === "PROVEN"
                  ? "border-emerald-400/40 text-emerald-300 bg-emerald-400/10"
                  : data.status === "PARTIAL"
                  ? "border-amber-400/40 text-amber-300 bg-amber-400/10"
                  : "border-red-400/40 text-red-300 bg-red-400/10"
              }`}
            >
              {data.status}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground font-mono">
            <span>Score: <strong className="text-foreground">{data.evidenceScore}/100</strong></span>
            <span>•</span>
            <span>{data.repositoryCount} repos</span>
            <span>•</span>
            <span>{data.evidenceCount} evidence items</span>
          </div>
          <div className="p-2.5 rounded-lg border border-border/60 bg-muted/30 text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Verification Rationale: </strong>
            {data.reason}
          </div>
        </div>
      )}

      {/* 2. Repository Node Detail */}
      {data.type === "repository" && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <FolderGit2 className="size-4 text-blue-400" />
            <h4 className="text-sm font-bold text-foreground font-mono">{data.name}</h4>
          </div>
          {data.description && (
            <p className="text-muted-foreground leading-relaxed">{data.description}</p>
          )}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
            {data.language && <span>Language: <strong className="text-foreground">{data.language}</strong></span>}
            {data.stargazersCount !== undefined && <span>Stars: {data.stargazersCount}</span>}
          </div>
          {data.htmlUrl && (
            <a
              href={data.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium hover:underline pt-1"
            >
              View Repository on GitHub
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      )}

      {/* 3. Evidence Node Detail */}
      {data.type === "evidence" && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
              {data.evidenceType.replace(/_/g, " ")}
            </span>
            <span className="font-mono text-muted-foreground">{data.repositoryName}</span>
          </div>
          <p className="p-2.5 rounded-lg border border-border/60 bg-muted/30 text-foreground font-mono leading-relaxed">
            {data.extractedFact}
          </p>
          {data.sourceUrl && (
            <a
              href={data.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium hover:underline pt-1"
            >
              Inspect Source on GitHub
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      )}

      {/* 4. Artifact Node Detail */}
      {data.type === "artifact" && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold font-mono text-foreground truncate">{data.label}</h4>
            <span className="text-[10px] text-muted-foreground font-mono">{data.repositoryName}</span>
          </div>
          {data.filePath && (
            <p className="text-muted-foreground font-mono">File: {data.filePath}</p>
          )}
          {data.commitSha && (
            <p className="text-muted-foreground font-mono">Commit: {data.commitSha.slice(0, 7)}</p>
          )}
          {data.sourceUrl && (
            <Button asChild size="sm" className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs h-8">
              <a href={data.sourceUrl} target="_blank" rel="noreferrer">
                Open on GitHub <ExternalLink className="size-3.5 ml-1.5" />
              </a>
            </Button>
          )}
        </div>
      )}

      {/* 5. Candidate Node Detail */}
      {data.type === "candidate" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <UserCheck className="size-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-foreground">{data.name}</h4>
          </div>
          <p className="text-muted-foreground font-mono">@{data.githubUsername}</p>
          <p className="text-[11px] text-muted-foreground">Analyzed: {data.analyzedAt}</p>
        </div>
      )}

      {/* 6. Claim Node Detail */}
      {data.type === "claim" && (
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-foreground">{data.displayName}</h4>
          <p className="text-muted-foreground">Category: {data.category}</p>
          {data.sourceSection && <p className="text-muted-foreground">Section: {data.sourceSection}</p>}
          {data.sourceText && (
            <p className="p-2 rounded border border-border/60 bg-muted/20 text-muted-foreground font-mono text-[11px]">
              &ldquo;{data.sourceText}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* 7. Empty State Node Detail */}
      {data.type === "empty_state" && (
        <div className="space-y-2 text-red-300">
          <div className="flex items-center gap-1.5 font-bold">
            <CircleDashed className="size-4 text-red-400" />
            <span>Claimed-Only Status</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">{data.message}</p>
        </div>
      )}
    </div>
  );
}
