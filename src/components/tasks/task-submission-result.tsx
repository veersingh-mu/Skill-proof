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
      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#E3F3E8] text-[#2E8B57] border border-[#2E8B57]/30">
        VERIFIED
      </span>
    );
  }
  if (status === "PARTIAL") {
    return (
      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#FFF0D7] text-[#D99125] border border-[#D99125]/30">
        PARTIAL
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#FAF7F2] text-[#756B64] border border-[#E7DCD1]">
      INSUFFICIENT
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
      <div className="rounded-2xl border border-[#E7DCD1] bg-white p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2E8B57]">
              <CheckCircle2 className="size-4" />
              Task Submission Analyzed
            </div>
            <div className="flex items-center gap-2 min-w-0 max-w-full">
              <GitHubIcon className="size-4 text-[#756B64] shrink-0" />
              <a
                href={repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="text-base font-extrabold text-[#241914] hover:underline inline-flex items-center gap-1.5 min-w-0 max-w-full truncate"
              >
                <span className="truncate">{githubOwner}/{githubRepo}</span>
                <ExternalLink className="size-3 text-[#756B64] shrink-0" />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-[#E3F3E8] text-[#2E8B57] border border-[#2E8B57]/30 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#2E8B57] animate-pulse" />
              Real Evidence Analyzed
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              className="text-xs font-semibold h-9 min-h-[38px] border-[#E7DCD1] text-[#241914] hover:bg-[#FAF7F2] rounded-xl"
            >
              <RotateCcw className="size-3 mr-1.5" />
              Analyze Another Repo
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Verification Change (BEFORE vs AFTER) */}
      <div className="rounded-2xl border border-[#2E8B57]/30 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E7DCD1] pb-3.5 min-w-0">
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#2E8B57] uppercase tracking-wider truncate">
              Deterministic Verification Result
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#241914] mt-0.5 truncate">Target Skill: {skill}</h3>
          </div>
          {scoreDelta > 0 ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2E8B57] bg-[#E3F3E8] border border-[#2E8B57]/30 px-3 py-1 rounded-full shrink-0">
              <TrendingUp className="size-3.5" />
              +{scoreDelta} points
            </div>
          ) : (
            <div className="text-xs text-[#756B64] bg-[#FAF7F2] border border-[#E7DCD1] px-3 py-1 rounded-full shrink-0">
              +0 points (No score change)
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* BEFORE */}
          <div className="rounded-xl border border-[#E7DCD1] bg-[#FAF7F2] p-4 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#756B64]">
              Before Submission
            </span>
            <div className="flex items-center justify-between pt-1">
              <StatusPill status={beforeVerification.status} />
              <span className="text-sm font-mono font-bold text-[#756B64]">
                Score: {beforeVerification.evidenceScore}/100
              </span>
            </div>
            <p className="text-xs text-[#756B64] mt-2 line-clamp-2">
              {beforeVerification.reason}
            </p>
          </div>

          {/* AFTER */}
          <div className={`rounded-xl border p-4 space-y-2 ${
            statusChanged
              ? "border-[#2E8B57]/40 bg-[#E3F3E8]/30"
              : "border-[#E7DCD1] bg-[#FAF7F2]"
          }`}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E8B57]">
              After Submission (Re-verified)
            </span>
            <div className="flex items-center justify-between pt-1">
              <StatusPill status={afterVerification.status} />
              <span className="text-sm font-mono font-bold text-[#241914]">
                Score: {afterVerification.evidenceScore}/100
              </span>
            </div>
            <p className="text-xs text-[#241914] mt-2 line-clamp-2 font-medium">
              {afterVerification.reason}
            </p>
          </div>
        </div>

        {/* Change Banner */}
        <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E7DCD1] space-y-1">
          <div className="text-xs font-bold text-[#241914] flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-[#A95F3D]" />
            Outcome:{" "}
            {statusChanged ? (
              <span className="text-[#2E8B57]">
                Verification status upgraded ({beforeVerification.status} → {afterVerification.status})
              </span>
            ) : scoreDelta > 0 ? (
              <span className="text-[#241914]">
                Evidence score improved (+{scoreDelta} pts), verification status unchanged ({afterVerification.status})
              </span>
            ) : (
              <span className="text-[#756B64]">
                Verification status remains {afterVerification.status}
              </span>
            )}
          </div>
          <div className="text-xs text-[#756B64] leading-relaxed">
            {evidenceDiff.reasons.map((r, i) => (
              <div key={i} className="mt-1">• {r}</div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. NEW EVIDENCE DETECTED */}
      <div className="rounded-2xl border border-[#E7DCD1] bg-white p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#241914]">
            <FileCode className="size-4 text-[#A95F3D] shrink-0" />
            <span>New Evidence Discovered ({evidenceDiff.added.length})</span>
          </div>
          <span className="text-xs text-[#756B64]">
            {evidenceDiff.unchanged.length} prior evidence items unchanged
          </span>
        </div>

        {evidenceDiff.added.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-dashed border-[#E7DCD1] text-xs text-[#756B64] text-center">
            No new qualifying technical artifacts for {skill} were found in this repository.
          </div>
        ) : (
          <div className="space-y-2">
            {evidenceDiff.added.map((ev, i) => (
              <div
                key={ev.id || i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E7DCD1] text-xs min-w-0"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#E3F3E8] text-[#2E8B57] border border-[#2E8B57]/30 shrink-0">
                      {ev.type.replace(/_/g, " ")}
                    </span>
                    {ev.filePath && (
                      <span className="font-mono text-[#756B64] text-[11px] break-all">
                        {ev.filePath}
                      </span>
                    )}
                  </div>
                  <p className="text-[#241914] font-bold">{ev.extractedFact}</p>
                </div>

                {ev.sourceUrl && (
                  <a
                    href={ev.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-[#A95F3D] hover:text-[#8E4F32] inline-flex items-center gap-1 font-semibold hover:underline text-[11px]"
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
        <div className="rounded-2xl border border-[#E7DCD1] bg-white p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#241914]">
              <CheckSquare className="size-4 text-[#2E8B57]" />
              Task Acceptance Criteria Mapping
            </div>
            <span className="text-[11px] text-[#756B64]">
              Informational match against detected repository artifacts
            </span>
          </div>

          <div className="space-y-2">
            {criteriaAssessment.map((crit, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  crit.detected
                    ? "bg-[#E3F3E8]/40 border-[#2E8B57]/30 text-[#241914]"
                    : "bg-[#FAF7F2] border-[#E7DCD1] text-[#756B64]"
                }`}
              >
                {crit.detected ? (
                  <CheckCircle2 className="size-4 text-[#2E8B57] shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="size-4 text-[#D99125] shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5 flex-1">
                  <div className="font-bold text-[#241914]">{crit.criterion}</div>
                  {crit.matchingFact ? (
                    <div className="text-[11px] text-[#2E8B57] font-medium">
                      Matched: {crit.matchingFact}
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#756B64]">
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
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button
          asChild
          size="sm"
          className="w-full sm:w-auto bg-[#A95F3D] text-white hover:bg-[#8E4F32] font-bold text-xs h-11 min-h-[44px] px-6 rounded-xl shadow-xs"
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
          className="w-full sm:w-auto text-xs font-semibold h-11 min-h-[44px] px-6 border-[#E7DCD1] bg-white text-[#241914] hover:bg-[#FAF7F2] rounded-xl"
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
          className="w-full sm:w-auto text-xs font-semibold h-11 min-h-[44px] px-6 text-[#756B64] hover:text-[#241914] hover:bg-[#FAF7F2] rounded-xl"
        >
          Submit Another Repository
        </Button>
      </div>
    </div>
  );
}
