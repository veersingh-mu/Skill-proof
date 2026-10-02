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
    BEGINNER: "bg-[#E3F3E8] text-[#2E8B57] border-[#2E8B57]/30",
    INTERMEDIATE: "bg-[#FFF0D7] text-[#D99125] border-[#D99125]/30",
    ADVANCED: "bg-[#F4E2D3] text-[#A95F3D] border-[#E8C5B0]",
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${map[difficulty] ?? map["INTERMEDIATE"]}`}>
      {difficulty}
    </span>
  );
}

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-bold text-[#A95F3D] uppercase tracking-wider mb-2.5">
      <Icon className="size-3.5 text-[#A95F3D]" />
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
      <div className="rounded-2xl border border-[#A95F3D]/25 bg-white p-6 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#A95F3D] font-bold uppercase tracking-wider">
              <Sparkles className="size-3.5 text-[#A95F3D]" />
              Practical Verification Task
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#241914] leading-snug">{task.title}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <DifficultyBadge difficulty={task.difficulty} />
            <span className="flex items-center gap-1.5 text-xs text-[#756B64] font-medium bg-[#FAF7F2] border border-[#E7DCD1] rounded-lg px-2.5 py-1">
              <Clock className="size-3 text-[#756B64]" />
              {task.estimatedTime}
            </span>
          </div>
        </div>

        <p className="text-sm text-[#756B64] leading-relaxed">{task.objective}</p>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E7DCD1]">
          <span className="text-xs text-[#756B64]">
            Targeting gap:{" "}
            <span className="font-bold text-[#241914]">{gapContext.skill}</span>
          </span>
          <span className="text-[#E7DCD1]">·</span>
          <span className={`text-xs font-bold ${gapContext.gapType === "EVIDENCE_GAP" ? "text-[#C94A4A]" : "text-[#D99125]"}`}>
            {gapContext.gapType.replace("_", " ")}
          </span>
          <span className="text-[#E7DCD1]">·</span>
          <span className="text-xs text-[#756B64]">
            Score: <span className="font-bold text-[#241914] font-mono">{gapContext.verificationScore}/100</span>
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E7DCD1] bg-white p-5 shadow-xs space-y-2">
        <SectionHeader icon={FileText} label="Scenario" />
        <p className="text-sm text-[#756B64] leading-relaxed">{task.scenario}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#E7DCD1] bg-white p-5 shadow-xs space-y-2">
          <SectionHeader icon={ListChecks} label="Requirements" />
          <ul className="space-y-2">
            {task.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[#241914] min-w-0 break-words">
                <span className="mt-0.5 size-4 shrink-0 rounded bg-[#F4E2D3] border border-[#E8C5B0] flex items-center justify-center text-[10px] font-bold text-[#A95F3D]">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 leading-snug">{req}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-[#E7DCD1] bg-white p-5 shadow-xs space-y-2">
          <SectionHeader icon={Zap} label="Implementation Steps" />
          <ol className="space-y-2">
            {task.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[#241914] min-w-0 break-words">
                <span className="mt-0.5 size-4 shrink-0 rounded-full bg-[#E3F3E8] border border-[#2E8B57]/30 flex items-center justify-center text-[10px] font-bold text-[#2E8B57]">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 leading-snug">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E7DCD1] bg-white p-5 shadow-xs space-y-2">
        <SectionHeader icon={Code2} label="Deliverables" />
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {task.deliverables.map((d, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-[#241914] min-w-0 break-words">
              <span className="size-2 rounded-full bg-[#2E8B57] shrink-0" />
              <span className="min-w-0 flex-1">{d}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-[#E7DCD1] bg-white p-5 shadow-xs space-y-2">
        <SectionHeader icon={CheckSquare} label="Acceptance Criteria" />
        <ul className="space-y-2">
          {task.acceptanceCriteria.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[#241914] min-w-0 break-words">
              <span className="mt-0.5 size-4 shrink-0 rounded border border-[#E7DCD1] bg-[#FAF7F2] flex items-center justify-center text-[10px] text-[#756B64]">
                ✓
              </span>
              <span className="min-w-0 flex-1 leading-snug">{c}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Current Evidence vs Future Expected Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CURRENT EVIDENCE */}
        <div className="rounded-2xl border border-[#E7DCD1] bg-white p-5 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <SectionHeader icon={FileText} label="Current Evidence Status" />
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
              gapContext.candidateStatus === "CLAIMED_ONLY"
                ? "bg-[#FAF7F2] text-[#C94A4A] border border-[#C94A4A]/30"
                : "bg-[#FFF0D7] text-[#D99125] border border-[#D99125]/30"
            }`}>
              {gapContext.candidateStatus.replace("_", " ")} ({gapContext.verificationScore}/100)
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E7DCD1] text-xs text-[#756B64] leading-relaxed">
            <strong className="text-[#241914] block mb-1">Current factual state:</strong>
            {gapContext.explanation}
          </div>
          <p className="text-[11px] text-[#756B64] italic">
            This verification status is deterministic and cannot be modified by AI task generation.
          </p>
        </div>

        {/* EXPECTED EVIDENCE FROM TASK (FUTURE) */}
        <div className="rounded-2xl border border-[#A95F3D]/25 bg-[#FAF7F2] p-5 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <SectionHeader icon={FlaskConical} label="Expected Evidence From Task" />
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider bg-[#F4E2D3] text-[#A95F3D] border border-[#E8C5B0]">
              Future Artifacts
            </span>
          </div>
          <div className="flex items-start gap-2 text-[11px] text-[#756B64] mb-2">
            <AlertTriangle className="size-3.5 shrink-0 mt-0.5 text-[#D99125]" />
            <span>
              These are <strong>expected future artifacts</strong> — not current evidence. Completing
              this task will produce GitHub artifacts that can be evaluated later.
            </span>
          </div>
          <ul className="space-y-1.5">
            {task.evidenceProduced.map((e, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-[#241914]">
                <span className="size-2 rounded-full bg-[#A95F3D] shrink-0" />
                {e}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {task.suggestedTechnologies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {task.suggestedTechnologies.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-white text-[#241914] border border-[#E7DCD1] shadow-2xs"
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

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          disabled={isRegenerating || isAnalyzing}
          className="text-xs font-semibold h-9 border-[#E7DCD1] text-[#241914] hover:bg-[#FAF7F2] rounded-xl"
        >
          <RefreshCw className={`size-3 mr-1.5 ${isRegenerating ? "animate-spin" : ""}`} />
          {isRegenerating ? "Regenerating..." : "Regenerate Task"}
        </Button>

        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs font-semibold h-9 text-[#A95F3D] hover:bg-[#F4E2D3]/40 rounded-xl"
        >
          <Link href={`/evidence?skill=${encodeURIComponent(task.skill)}`}>
            <Network className="size-3 mr-1.5 text-[#A95F3D]" />
            View Evidence Graph
          </Link>
        </Button>

        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs font-semibold h-9 text-[#756B64] hover:text-[#241914] hover:bg-[#FAF7F2] rounded-xl"
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