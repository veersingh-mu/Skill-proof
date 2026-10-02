import {
  Box,
  CheckCircle2,
  ExternalLink,
  FileCode2,
  GitCommitHorizontal,
  Layers,
  PackageCheck,
  Server,
  TestTube2,
  Workflow,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GitHubEvidenceItem, GitHubEvidenceType } from "@/types";

interface SimpleEvidenceCardProps {
  type: "file" | "dependency" | "commit";
  title: string;
  meta: string;
}

interface FullEvidenceCardProps {
  evidence: GitHubEvidenceItem;
  className?: string;
}

type EvidenceCardProps = SimpleEvidenceCardProps | FullEvidenceCardProps;

function getEvidenceMeta(type: GitHubEvidenceType) {
  switch (type) {
    case "dockerfile":
    case "docker_compose":
      return { label: "Docker Artifact", icon: Server, color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10" };
    case "kubernetes_manifest":
      return { label: "Kubernetes", icon: Server, color: "text-teal-400 border-teal-500/30 bg-teal-500/10" };
    case "cloud_configuration":
      return { label: "Cloud Config", icon: Server, color: "text-amber-400 border-amber-500/30 bg-amber-500/10" };
    case "ci_cd":
      return { label: "CI/CD Pipeline", icon: Workflow, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };
    case "test":
      return { label: "Test Suite", icon: TestTube2, color: "text-violet-400 border-violet-500/30 bg-violet-500/10" };
    case "framework":
      return { label: "Framework", icon: Layers, color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10" };
    case "dependency":
    case "package_manifest":
      return { label: "Dependency", icon: Box, color: "text-blue-400 border-blue-500/30 bg-blue-500/10" };
    default:
      return { label: "Technical Artifact", icon: FileCode2, color: "text-zinc-400 border-zinc-700 bg-zinc-800/50" };
  }
}

export function EvidenceCard(props: EvidenceCardProps) {
  // Support simple legacy props
  if ("title" in props) {
    const Icon =
      props.type === "file"
        ? FileCode2
        : props.type === "dependency"
        ? PackageCheck
        : GitCommitHorizontal;

    return (
      <Card className="border-border/80 bg-card/60">
        <CardContent className="flex items-center gap-3 p-4">
          <span className="grid size-9 place-items-center rounded-lg bg-secondary/80">
            <Icon className="size-4 text-indigo-400" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">{props.title}</p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{props.meta}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full technical artifact card (Section 12)
  const { evidence, className } = props;
  const meta = getEvidenceMeta(evidence.type);
  const Icon = meta.icon;
  const repoName = evidence.repositoryName ?? evidence.sourceUrl.split("/").slice(3, 5).join("/");
  const artifactName = evidence.filePath ?? evidence.extractedFact;

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card/70 p-4 transition-all duration-150 hover:border-border hover:bg-card/90",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={cn("grid size-8 place-items-center rounded-lg border", meta.color)}>
            <Icon className="size-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground font-mono">
                {artifactName}
              </span>
              <CheckCircle2 className="size-3.5 text-emerald-400" />
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">
              {meta.label}
            </p>
          </div>
        </div>

        <Badge variant="outline" className="text-[10px] font-mono border-border bg-secondary/50 text-muted-foreground">
          Source: GitHub
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2.5 text-xs text-muted-foreground font-mono">
        <span className="truncate max-w-[280px]">
          repo: <span className="text-zinc-300">{repoName}</span>
        </span>

        {evidence.sourceUrl && (
          <a
            href={evidence.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>Open on GitHub</span>
            <ExternalLink className="size-3" />
          </a>
        )}
      </div>

      {evidence.extractedFact && evidence.extractedFact !== artifactName && (
        <div className="mt-2 rounded-md bg-secondary/30 px-2.5 py-1 text-[11px] font-mono text-zinc-400 border border-border/40">
          fact: {evidence.extractedFact}
        </div>
      )}
    </div>
  );
}
