"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
  ExternalLink,
  FileCode,
  Network,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TaskSubmission } from "@/lib/tasks/types";
import type { SkillStatus } from "@/types";

function GitHubIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

interface TaskSubmissionResultProps {
  submission: TaskSubmission;
  onReset: () => void;
}

function StatusPill({ status }: { status: SkillStatus }) {
  if (status === "PROVEN") {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        PROVEN
      </span>
    );
  }
  if (status === "PARTIAL") {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
        PARTIAL
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-secondary text-zinc-300 border border-border">
      CLAIMED ONLY
    </span>
  );
}

export function TaskSubmissionResult({ submission, onReset }: TaskSubmissionResultProps) {
  const {
    skill,
    githubOwner,
    githubRepo,
    repositoryUrl,
    beforeVerification,
    afterVerification,
    evidenceDiff,
    criteriaAssessment,
  } = submission;

  const statusChanged = beforeVerification.status !== afterVerification.status;
  const scoreDelta = evidenceDiff.scoreDelta;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* 1. Repository & Analysis Header */}
      <div className="rounded-xl border border-border/80 bg-card/60 p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <CheckCircle2 className="size-4" />
              Task Submission Analyzed
            </div>
            <div className="flex items-center gap-2 min-w-0 max-w-full">
              <GitHubIcon className="size-4 text-muted-foreground shrink-0" />
              <a
                href={repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="text-base font-bold text-foreground hover:underline inline-flex items-center gap-1.5 min-w-0 max-w-full truncate"
              >
                <span className="truncate">{githubOwner}/{githubRepo}</span>
                <ExternalLink className="size-3 text-muted-foreground shrink-0" />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              Real Evidence Analyzed
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              className="text-xs h-9 min-h-[38px] border-border hover:bg-muted"
            >
              <RotateCcw className="size-3 mr-1.5" />
              Analyze Another Repo
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Verification Change (BEFORE vs AFTER) */}
      <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.04] to-card/60 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3 min-w-0">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider truncate">
              Deterministic Verification Result
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground mt-0.5 truncate">Target Skill: {skill}</h3>
          </div>
          {scoreDelta > 0 ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full shrink-0">
              <TrendingUp className="size-3.5" />
              +{scoreDelta} points
            </div>
          ) : (
            <div className="text-xs text-muted-foreground bg-muted/40 border border-border/40 px-3 py-1 rounded-full shrink-0">
              +0 points (No score change)
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* BEFORE */}
          <div className="rounded-lg border border-border/60 bg-background/50 p-4 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Before Submission
            </span>
            <div className="flex items-center justify-between pt-1">
              <StatusPill status={beforeVerification.status} />
              <span className="text-sm font-mono font-bold text-muted-foreground">
                Score: {beforeVerification.evidenceScore}/100
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {beforeVerification.reason}
            </p>
          </div>

          {/* AFTER */}
          <div className={`rounded-lg border p-4 space-y-2 ${
            statusChanged
              ? "border-emerald-500/40 bg-emerald-500/[0.06]"
              : "border-border/60 bg-background/50"
          }`}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              After Submission (Re-verified)
            </span>
            <div className="flex items-center justify-between pt-1">
              <StatusPill status={afterVerification.status} />
              <span className="text-sm font-mono font-bold text-foreground">
                Score: {afterVerification.evidenceScore}/100
              </span>
            </div>
            <p className="text-xs text-foreground/90 mt-2 line-clamp-2">
              {afterVerification.reason}
            </p>
          </div>
        </div>

        {/* Change Banner */}
        <div className="p-3.5 rounded-lg bg-background/60 border border-border/60 space-y-1">
          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-emerald-400" />
            Outcome:{" "}
            {statusChanged ? (
              <span className="text-emerald-400">
                Verification status upgraded ({beforeVerification.status} → {afterVerification.status})
              </span>
            ) : scoreDelta > 0 ? (
              <span className="text-foreground">
                Evidence score improved (+{scoreDelta} pts), verification status unchanged ({afterVerification.status})
              </span>
            ) : (
              <span className="text-muted-foreground">
                Verification status remains {afterVerification.status}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            {evidenceDiff.reasons.map((r, i) => (
              <div key={i} className="mt-1">• {r}</div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. NEW EVIDENCE DETECTED */}
      <div className="rounded-xl border border-border/80 bg-card/60 p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground">
            <FileCode className="size-4 text-emerald-400 shrink-0" />
            <span>New Evidence Discovered ({evidenceDiff.added.length})</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {evidenceDiff.unchanged.length} prior evidence items unchanged
          </span>
        </div>

        {evidenceDiff.added.length === 0 ? (
          <div className="p-4 rounded-lg bg-background/40 border border-dashed border-border/60 text-xs text-muted-foreground text-center">
            No new qualifying technical artifacts for {skill} were found in this repository.
          </div>
        ) : (
          <div className="space-y-2">
            {evidenceDiff.added.map((ev, i) => (
              <div
                key={ev.id || i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-background/60 border border-border/40 text-xs min-w-0"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shrink-0">
                      {ev.type.replace(/_/g, " ")}
                    </span>
                    {ev.filePath && (
                      <span className="font-mono text-muted-foreground text-[11px] break-all">
                        {ev.filePath}
                      </span>
                    )}
                  </div>
                  <p className="text-foreground/90 font-medium">{ev.extractedFact}</p>
                </div>

                {ev.sourceUrl && (
                  <a
                    href={ev.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-medium hover:underline text-[11px]"
                  >
                    View on GitHub
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. TASK ACCEPTANCE CRITERIA MAPPING */}
      {criteriaAssessment.length > 0 && (
        <div className="rounded-xl border border-border/80 bg-card/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground">
              <CheckSquare className="size-4 text-emerald-400" />
              Task Acceptance Criteria Mapping
            </div>
            <span className="text-[11px] text-muted-foreground">
              Informational match against detected repository artifacts
            </span>
          </div>

          <div className="space-y-2">
            {criteriaAssessment.map((crit, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                  crit.detected
                    ? "bg-emerald-500/[0.04] border-emerald-500/30 text-foreground"
                    : "bg-background/40 border-border/40 text-muted-foreground"
                }`}
              >
                {crit.detected ? (
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="size-4 text-amber-400/80 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5 flex-1">
                  <div className="font-medium">{crit.criterion}</div>
                  {crit.matchingFact ? (
                    <div className="text-[11px] text-emerald-300/80">
                      Matched: {crit.matchingFact}
                    </div>
                  ) : (
                    <div className="text-[11px] text-muted-foreground/80">
                      Artifact not detected in submitted repository
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Navigation Actions */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2">
        <Button
          asChild
          size="sm"
          className="w-full sm:w-auto bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-semibold text-xs h-10 sm:h-9 min-h-[44px] sm:min-h-0"
        >
          <Link href={`/evidence?skill=${encodeURIComponent(skill)}`}>
            <Network className="size-3.5 mr-1.5" />
            View Evidence Graph
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full sm:w-auto text-xs h-10 sm:h-9 min-h-[44px] sm:min-h-0 border-border hover:bg-muted"
        >
          <Link href="/dashboard">
            View Updated Dashboard
          </Link>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="w-full sm:w-auto text-xs h-10 sm:h-9 min-h-[44px] sm:min-h-0 text-muted-foreground hover:text-foreground"
        >
          Submit Another Repository
        </Button>
      </div>
    </div>
  );
}
