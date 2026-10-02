"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckSquare,
  Clock,
  Code2,
  ExternalLink,
  FileText,
  FlaskConical,
  ListChecks,
  Network,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MicroTask, TaskGapContext } from "@/lib/ai/types";
import type { TaskSubmission } from "@/lib/tasks/types";
import { saveTaskSubmission } from "@/lib/tasks/storage";
import { loadVerificationSession, saveVerificationSession, applySubmissionToSession } from "@/lib/evidence/session";
import { TaskSubmissionForm } from "./task-submission-form";
import { TaskSubmissionResult } from "./task-submission-result";

interface MicroTaskCardProps {
  task: MicroTask;
  gapContext: TaskGapContext;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

function DifficultyBadge({ difficulty }: { difficulty: MicroTask["difficulty"] }) {
  const map: Record<string, string> = {
    BEGINNER: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    INTERMEDIATE: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    ADVANCED: "bg-red-500/15 text-red-300 border-red-500/30",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${map[difficulty] ?? map["INTERMEDIATE"]}`}>
      {difficulty}
    </span>
  );
}

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
      <Icon className="size-3.5 text-emerald-400" />
      {label}
    </div>
  );
}

export function MicroTaskCard({ task, gapContext, onRegenerate, isRegenerating }: MicroTaskCardProps) {
  const [submission, setSubmission] = useState<TaskSubmission | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnalyzeSubmission = async (repositoryUrl: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    const session = loadVerificationSession();
    const existingEvidence = session?.githubResult.evidence ?? [];
    const existingRepositories = session?.githubResult.repositories ?? [];
    const previousVerification = session?.evaluation.verifications.find(
      (v) => v.skill.toLowerCase() === task.skill.toLowerCase()
    );

    try {
      const response = await fetch("/api/tasks/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          skill: task.skill,
          repositoryUrl,
          task,
          existingEvidence,
          existingRepositories,
          previousVerification,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze repository submission.");
      }

      // If an active session exists in localStorage, deterministically sync the new verification
      if (session) {
        const updatedSession = applySubmissionToSession(
          session,
          task.skill,
          data.submission.afterVerification,
          data.allEvidence,
          data.allRepositories
        );
        saveVerificationSession(updatedSession);
      }

      // Persist completed submission for portfolio tracking
      saveTaskSubmission(data.submission);

      setSubmission(data.submission);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Submission analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.06] to-card/60 p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
              <Sparkles className="size-3.5" />
              AI-Generated Task
            </div>
            <h2 className="text-xl font-bold text-foreground leading-snug">{task.title}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={task.difficulty} />
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background/60 border border-border/40 rounded-full px-2.5 py-1">
              <Clock className="size-3 text-muted-foreground" />
              {task.estimatedTime}
            </span>
          </div>
        </div>

        <p className="text-sm text-foreground/90 leading-relaxed">{task.objective}</p>

        <div className="flex flex-wrap gap-2 pt-1 border-t border-border/40">
          <span className="text-[11px] text-muted-foreground">
            Targeting gap:{" "}
            <span className="font-semibold text-foreground">{gapContext.skill}</span>
          </span>
          <span className="text-muted-foreground">·</span>
          <span className={`text-[11px] font-semibold ${gapContext.gapType === "EVIDENCE_GAP" ? "text-red-300" : "text-amber-300"}`}>
            {gapContext.gapType.replace("_", " ")}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-[11px] text-muted-foreground">
            Score: <span className="font-semibold text-foreground font-mono">{gapContext.verificationScore}/100</span>
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-2">
        <SectionHeader icon={FileText} label="Scenario" />
        <p className="text-sm text-muted-foreground leading-relaxed">{task.scenario}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-2">
          <SectionHeader icon={ListChecks} label="Requirements" />
          <ul className="space-y-1.5">
            {task.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/90 min-w-0 break-words">
                <span className="mt-0.5 size-4 shrink-0 rounded bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">{req}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-2">
          <SectionHeader icon={Zap} label="Implementation Steps" />
          <ol className="space-y-1.5">
            {task.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/90 min-w-0 break-words">
                <span className="mt-0.5 size-4 shrink-0 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-emerald-300">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-2">
        <SectionHeader icon={Code2} label="Deliverables" />
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {task.deliverables.map((d, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-foreground/90 min-w-0 break-words">
              <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="min-w-0 flex-1">{d}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-2">
        <SectionHeader icon={CheckSquare} label="Acceptance Criteria" />
        <ul className="space-y-1.5">
          {task.acceptanceCriteria.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/90 min-w-0 break-words">
              <span className="mt-0.5 size-4 shrink-0 rounded border border-border/60 bg-background/50 flex items-center justify-center text-[10px] text-muted-foreground">
                □
              </span>
              <span className="min-w-0 flex-1">{c}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Current Evidence vs Future Expected Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CURRENT EVIDENCE */}
        <div className="rounded-xl border border-border/80 bg-card/60 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <SectionHeader icon={FileText} label="Current Evidence Status" />
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
              gapContext.candidateStatus === "CLAIMED_ONLY"
                ? "bg-red-500/15 text-red-300 border border-red-500/30"
                : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
            }`}>
              {gapContext.candidateStatus.replace("_", " ")} ({gapContext.verificationScore}/100)
            </span>
          </div>
          <div className="p-3 rounded-lg bg-background/50 border border-border/40 text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground/90 block mb-1">Current factual state:</strong>
            {gapContext.explanation}
          </div>
          <p className="text-[11px] text-muted-foreground/70 italic">
            This verification status is deterministic and cannot be modified by AI task generation.
          </p>
        </div>

        {/* EXPECTED EVIDENCE FROM TASK (FUTURE) */}
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/[0.04] p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <SectionHeader icon={FlaskConical} label="Expected Evidence From Task (Future)" />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-blue-500/15 text-blue-300 border border-blue-500/30">
              Future Artifacts
            </span>
          </div>
          <div className="flex items-start gap-2 text-[11px] text-blue-300/80 mb-2">
            <AlertTriangle className="size-3.5 shrink-0 mt-0.5 text-blue-400" />
            <span>
              These are <strong>expected future artifacts</strong> — not current evidence. Completing
              this task will produce GitHub artifacts that can be evaluated later.
            </span>
          </div>
          <ul className="space-y-1.5">
            {task.evidenceProduced.map((e, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-foreground/90">
                <span className="size-1.5 rounded-full bg-blue-400 shrink-0" />
                {e}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {task.suggestedTechnologies.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {task.suggestedTechnologies.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted/60 text-muted-foreground border border-border/40"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* Phase 10: Task Submission & Deterministic Re-verification */}
      <div id="submit-work-section" className="pt-2">
        {submission ? (
          <TaskSubmissionResult
            submission={submission}
            onReset={() => setSubmission(null)}
          />
        ) : (
          <TaskSubmissionForm
            skill={task.skill}
            isAnalyzing={isAnalyzing}
            onSubmit={handleAnalyzeSubmission}
            errorMessage={errorMessage}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          disabled={isRegenerating || isAnalyzing}
          className="text-xs h-8 border-border hover:bg-muted"
        >
          <RefreshCw className={`size-3 mr-1.5 ${isRegenerating ? "animate-spin" : ""}`} />
          {isRegenerating ? "Regenerating..." : "Regenerate Task"}
        </Button>

        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs h-8 text-muted-foreground hover:text-emerald-300 hover:bg-emerald-500/10"
        >
          <Link href={`/evidence?skill=${encodeURIComponent(task.skill)}`}>
            <Network className="size-3 mr-1.5 text-emerald-400" />
            View Evidence Graph
          </Link>
        </Button>

        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs h-8 text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <Link href="/jobs">
            <ExternalLink className="size-3 mr-1.5" />
            Back to Skill Gaps
          </Link>
        </Button>
      </div>
    </div>
  );
}