"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  AlertCircle,
  Box,
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  ExternalLink,
  FileCode2,
  FolderGit2,
  GitCommit,
  Layers,
  Server,
  TestTube2,
  UserCheck,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type {
  ArtifactNodeData,
  CandidateNodeData,
  ClaimNodeData,
  EmptyStateNodeData,
  EvidenceNodeData,
  RepositoryNodeData,
  SkillNodeData,
} from "@/lib/evidence/graph";

// 1. CANDIDATE NODE
export const CandidateNode = memo(({ data }: { data: CandidateNodeData }) => {
  return (
    <div className="rounded-xl border border-emerald-500/40 bg-card/95 p-4 shadow-lg backdrop-blur-sm min-w-[200px] text-left transition-all hover:border-emerald-400">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <UserCheck className="size-3.5" />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
          Candidate Profile
        </span>
      </div>
      <h4 className="text-sm font-bold text-foreground truncate">{data.name}</h4>
      <p className="text-xs text-muted-foreground font-mono mt-0.5">@{data.githubUsername}</p>

      {/* Output Handle */}
      <Handle type="source" position={Position.Right} className="!bg-emerald-400 !size-2.5" />
    </div>
  );
});
CandidateNode.displayName = "CandidateNode";

// 2. CLAIM NODE
export const ClaimNode = memo(({ data }: { data: ClaimNodeData }) => {
  return (
    <div className="rounded-xl border border-border/90 bg-card/95 p-3.5 shadow-md backdrop-blur-sm min-w-[190px] text-left transition-all hover:border-foreground/30">
      <Handle type="target" position={Position.Left} className="!bg-slate-400 !size-2.5" />
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Resume Claim
        </span>
      </div>
      <h4 className="text-sm font-semibold text-foreground truncate">{data.displayName}</h4>
      <p className="text-[11px] text-muted-foreground truncate">{data.category}</p>
      <Handle type="source" position={Position.Right} className="!bg-slate-400 !size-2.5" />
    </div>
  );
});
ClaimNode.displayName = "ClaimNode";

// 3. SKILL NODE
export const SkillNode = memo(({ data }: { data: SkillNodeData }) => {
  const isProven = data.status === "PROVEN";
  const isPartial = data.status === "PARTIAL";

  const borderColor = isProven
    ? "border-emerald-500/40 hover:border-emerald-400 hover:shadow-emerald-500/10"
    : isPartial
    ? "border-amber-500/40 hover:border-amber-400 hover:shadow-amber-500/10"
    : "border-zinc-700 hover:border-zinc-600";

  const badgeClass = isProven
    ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
    : isPartial
    ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
    : "border-zinc-600 bg-zinc-800 text-zinc-300";

  const StatusIcon = isProven ? CheckCircle2 : isPartial ? CircleAlert : CircleDashed;

  return (
    <div className={`rounded-xl border ${borderColor} bg-card/95 p-4 shadow-lg backdrop-blur-sm min-w-[220px] text-left transition-all duration-200`}>
      <Handle type="target" position={Position.Left} className="!bg-foreground !size-2.5" />
      <div className="flex items-center justify-between gap-2 mb-2">
        <Badge variant="outline" className={`text-[10px] font-mono font-bold px-2 py-0.5 gap-1 ${badgeClass}`}>
          <StatusIcon className="size-3" />
          {data.status}
        </Badge>
        <span className="text-xs font-mono font-bold text-foreground bg-secondary/80 px-1.5 py-0.5 rounded border border-border/60">
          {data.evidenceScore}/100
        </span>
      </div>
      <h4 className="text-base font-bold text-foreground">{data.skill}</h4>
      <p className="text-[11px] text-muted-foreground font-mono mt-1">
        {data.repositoryCount} {data.repositoryCount === 1 ? "repo" : "repos"} • {data.evidenceCount} {data.evidenceCount === 1 ? "evidence" : "evidence items"}
      </p>
      <Handle type="source" position={Position.Right} className="!bg-foreground !size-2.5" />
    </div>
  );
});
SkillNode.displayName = "SkillNode";

// 4. REPOSITORY NODE
export const RepositoryNode = memo(({ data }: { data: RepositoryNodeData }) => {
  return (
    <div className="rounded-xl border border-border/80 bg-card/95 p-3.5 shadow-md backdrop-blur-sm min-w-[210px] text-left transition-all hover:border-border">
      <Handle type="target" position={Position.Left} className="!bg-blue-400 !size-2.5" />
      <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
        <FolderGit2 className="size-3.5" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">GitHub Repo</span>
      </div>
      <h4 className="text-sm font-bold text-foreground font-mono truncate">{data.name}</h4>
      {data.language && (
        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono">
          {data.language}
        </span>
      )}
      <Handle type="source" position={Position.Right} className="!bg-blue-400 !size-2.5" />
    </div>
  );
});
RepositoryNode.displayName = "RepositoryNode";

// 5. EVIDENCE NODE
export const EvidenceNode = memo(({ data }: { data: EvidenceNodeData }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "dependency":
        return Box;
      case "framework":
      case "package_manifest":
        return Layers;
      case "dockerfile":
      case "docker_compose":
      case "kubernetes_manifest":
      case "cloud_configuration":
        return Server;
      case "test":
        return TestTube2;
      case "ci_cd":
        return Workflow;
      case "commit_recency":
        return GitCommit;
      default:
        return FileCode2;
    }
  };

  const Icon = getIcon(data.evidenceType);

  return (
    <div className="rounded-xl border border-border/70 bg-card/95 p-3 shadow-sm backdrop-blur-sm min-w-[220px] max-w-[260px] text-left transition-all hover:border-emerald-400/40">
      <Handle type="target" position={Position.Left} className="!bg-sky-400 !size-2.5" />
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="p-1 rounded bg-muted/50 text-sky-300 border border-border/50">
          <Icon className="size-3" />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
          {data.evidenceType.replace(/_/g, " ")}
        </span>
      </div>
      <p className="text-[11px] text-foreground font-mono leading-relaxed line-clamp-2 bg-muted/20 p-1.5 rounded border border-border/40">
        {data.extractedFact}
      </p>
      <Handle type="source" position={Position.Right} className="!bg-sky-400 !size-2.5" />
    </div>
  );
});
EvidenceNode.displayName = "EvidenceNode";

// 6. ARTIFACT NODE
export const ArtifactNode = memo(({ data }: { data: ArtifactNodeData }) => {
  return (
    <div className="rounded-xl border border-purple-400/30 bg-card/95 p-3 shadow-md backdrop-blur-sm min-w-[200px] text-left transition-all hover:border-purple-400/60">
      <Handle type="target" position={Position.Left} className="!bg-purple-400 !size-2.5" />
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-300">
          Artifact
        </span>
        {data.sourceUrl && (
          <a
            href={data.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-0.5 text-[10px] font-mono hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            GitHub
            <ExternalLink className="size-2.5" />
          </a>
        )}
      </div>
      <p className="text-xs font-mono font-semibold text-foreground truncate">{data.label}</p>
      <p className="text-[10px] text-muted-foreground font-mono truncate">{data.repositoryName}</p>
    </div>
  );
});
ArtifactNode.displayName = "ArtifactNode";

// 7. EMPTY STATE NODE (FOR CLAIMED-ONLY SKILLS)
export const EmptyStateNode = memo(({ data }: { data: EmptyStateNodeData }) => {
  return (
    <div className="rounded-xl border border-dashed border-zinc-700 bg-secondary/30 p-3.5 shadow-sm min-w-[230px] max-w-[280px] text-left">
      <Handle type="target" position={Position.Left} className="!bg-zinc-500 !size-2.5" />
      <div className="flex items-center gap-1.5 mb-1 text-zinc-400">
        <AlertCircle className="size-3.5" />
        <span className="text-[10px] font-bold uppercase tracking-wider">No Public Evidence</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{data.message}</p>
    </div>
  );
});
EmptyStateNode.displayName = "EmptyStateNode";
