"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadVerificationSession } from "@/lib/evidence/session";
import { createSampleVerificationSession } from "@/lib/evidence/sample-session";
import { loadTaskSubmissions } from "@/lib/tasks/storage";
import { buildSkillProofPortfolio } from "@/lib/portfolio/builder";
import type { SkillProofPortfolio } from "@/lib/portfolio/types";
import type { JobMatchEvaluation } from "@/lib/jobs/types";

function loadInitialReport(): SkillProofPortfolio {
  if (typeof window === "undefined") {
    return buildSkillProofPortfolio(null);
  }

  const session = loadVerificationSession() || createSampleVerificationSession();
  const taskSubmissions = loadTaskSubmissions();

  let jobMatch: JobMatchEvaluation | null = null;
  try {
    const rawMatch = sessionStorage.getItem("skillproof_last_match");
    if (rawMatch) {
      jobMatch = JSON.parse(rawMatch) as JobMatchEvaluation;
    }
  } catch {
    // sessionStorage unavailable
  }

  return buildSkillProofPortfolio(session, taskSubmissions, jobMatch);
}

export function PortfolioReportView() {
  const [portfolio] = useState<SkillProofPortfolio>(loadInitialReport);

  if (!portfolio) {
    return (
      <div className="py-20 text-center text-xs text-muted-foreground">
        Generating SkillProof Report...
      </div>
    );
  }

  const { candidate, summary, skills, verificationHistory, tasks, skillGaps } = portfolio;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 print:p-0 print:m-0 print:max-w-none">
      {/* Top action bar (hidden in print) */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Button asChild variant="outline" size="sm" className="text-xs h-8">
          <Link href="/portfolio">
            <ArrowLeft className="size-3.5 mr-1.5" />
            Back to Interactive Portfolio
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => window.print()}
            className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-semibold text-xs h-8 shadow-sm"
          >
            <Printer className="size-3.5 mr-1.5" />
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Printable Report Document */}
      <div className="rounded-xl border border-border/80 bg-card p-8 sm:p-10 space-y-8 print:border-none print:p-0 print:bg-white print:text-zinc-950">
        {/* Document Header */}
        <div className="border-b border-border/80 pb-6 space-y-3 print:border-zinc-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold tracking-[0.14em] uppercase text-emerald-400 print:text-emerald-700">
              <ShieldCheck className="size-5" />
              SKILLPROOF
            </div>
            <span className="text-[11px] text-muted-foreground print:text-zinc-500 font-mono" suppressHydrationWarning>
              Generated {portfolio.generatedAt ? portfolio.generatedAt.slice(0, 10) : new Date().toISOString().slice(0, 10)}
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground print:text-zinc-900">
              Technical Skill Evidence Report
            </h1>
            <p className="text-xs text-muted-foreground print:text-zinc-600 mt-1 italic">
              &ldquo;Don&apos;t just claim skills. Prove them.&rdquo; — Verification is based on observable technical evidence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs pt-1" suppressHydrationWarning>
            <span className="font-semibold text-foreground print:text-zinc-900" suppressHydrationWarning>
              Candidate: {candidate.name}
            </span>
            {candidate.githubUsername && (
              <span className="text-muted-foreground print:text-zinc-600" suppressHydrationWarning>
                GitHub: github.com/{candidate.githubUsername}
              </span>
            )}
            {candidate.email && (
              <span className="text-muted-foreground print:text-zinc-600">
                Email: {candidate.email}
              </span>
            )}
          </div>
        </div>

        {/* Executive Verification Summary */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground print:text-zinc-900">
            Executive Evidence Summary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border border-border/60 bg-muted/30 print:border-zinc-300 print:bg-zinc-50">
              <span className="text-[10px] uppercase font-bold text-muted-foreground print:text-zinc-600 block">
                Claimed Skills
              </span>
              <span className="text-lg font-bold font-mono text-foreground print:text-zinc-900">
                {summary.claimedSkillsCount}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 print:border-zinc-300 print:bg-zinc-50">
              <span className="text-[10px] uppercase font-bold text-emerald-400 print:text-emerald-700 block">
                Proven Skills
              </span>
              <span className="text-lg font-bold font-mono text-emerald-300 print:text-emerald-800">
                {summary.provenCount}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 print:border-zinc-300 print:bg-zinc-50">
              <span className="text-[10px] uppercase font-bold text-amber-400 print:text-amber-700 block">
                Partial Skills
              </span>
              <span className="text-lg font-bold font-mono text-amber-300 print:text-amber-800">
                {summary.partialCount}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border/60 bg-muted/30 print:border-zinc-300 print:bg-zinc-50">
              <span className="text-[10px] uppercase font-bold text-muted-foreground print:text-zinc-600 block">
                Public Repositories
              </span>
              <span className="text-lg font-bold font-mono text-foreground print:text-zinc-900">
                {summary.repositoryCount} ({summary.evidenceCount} artifacts)
              </span>
            </div>
          </div>
        </div>

        {/* Skill Matrix Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground print:text-zinc-900">
            Skill Verification Matrix
          </h2>
          <div className="border border-border/60 rounded-lg overflow-x-auto print:border-zinc-300 print:overflow-visible">
            <table className="w-full text-left text-xs min-w-[580px] sm:min-w-0">
              <thead className="bg-muted/40 border-b border-border/60 print:bg-zinc-100 print:border-zinc-300 font-semibold text-muted-foreground print:text-zinc-700">
                <tr>
                  <th className="py-2.5 px-3">Skill</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Evidence</th>
                  <th className="py-2.5 px-3">Deterministic Verification Finding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 print:divide-zinc-200">
                {skills.map((s) => (
                  <tr key={s.skill} className="print:text-zinc-900">
                    <td className="py-2.5 px-3 font-semibold">{s.skill}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        s.status === "PROVEN"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 print:bg-emerald-100 print:text-emerald-900"
                          : s.status === "PARTIAL"
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 print:bg-amber-100 print:text-amber-900"
                          : "bg-red-500/15 text-red-300 border border-red-500/30 print:bg-red-100 print:text-red-900"
                      }`}>
                        {s.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">{s.evidenceScore}/100</td>
                    <td className="py-2.5 px-3 text-muted-foreground print:text-zinc-600">
                      {s.evidenceCount} {s.evidenceCount === 1 ? "item" : "items"} ({s.repositoryCount} {s.repositoryCount === 1 ? "repo" : "repos"})
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground print:text-zinc-700 text-[11px] leading-relaxed">
                      {s.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Technical Evidence Breakdown */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground print:text-zinc-900">
            Technical Evidence Breakdown
          </h2>

          <div className="space-y-4">
            {skills.filter((s) => s.evidenceItems.length > 0).map((s) => (
              <div key={s.skill} className="p-4 rounded-lg border border-border/60 bg-background/50 print:border-zinc-300 print:bg-zinc-50 space-y-2">
                <div className="flex items-center justify-between border-b border-border/40 pb-2 print:border-zinc-200">
                  <span className="font-bold text-sm text-foreground print:text-zinc-900">
                    {s.skill} Evidence ({s.evidenceItems.length})
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground print:text-zinc-600">
                    Score: {s.evidenceScore}/100
                  </span>
                </div>

                <div className="space-y-1.5">
                  {s.evidenceItems.map((ev, i) => (
                    <div key={ev.id || i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-foreground/90 print:text-zinc-800 font-medium">
                          • {ev.extractedFact}
                        </span>
                        {ev.filePath && (
                          <span className="text-[11px] text-muted-foreground print:text-zinc-500 font-mono block pl-3 break-all">
                            Path: {ev.filePath} ({ev.repositoryName})
                          </span>
                        )}
                      </div>
                      {ev.sourceUrl && (
                        <a
                          href={ev.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 print:text-emerald-700 hover:underline text-[11px] shrink-0 font-medium"
                        >
                          Source URL ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification History (Phase 10 before/after transitions) */}
        {verificationHistory.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground print:text-zinc-900">
              Proof Transitions (Before vs. After Work)
            </h2>
            <div className="space-y-3">
              {verificationHistory.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.04] print:border-zinc-300 print:bg-zinc-50 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{item.skill}: {item.previousStatus} ({item.previousScore}) → {item.newStatus} ({item.newScore})</span>
                    {item.scoreDelta > 0 && (
                      <span className="text-emerald-400 print:text-emerald-700">+{item.scoreDelta} points</span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground print:text-zinc-600">
                    Repository: {item.repositoryUrl}
                  </div>
                  {item.reasons.map((r, rIdx) => (
                    <div key={rIdx} className="text-[11px] text-muted-foreground print:text-zinc-700">• {r}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Practical Tasks */}
        {tasks.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground print:text-zinc-900">
              Completed Practical Tasks
            </h2>
            <div className="space-y-2 text-xs">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg border border-border/60 bg-muted/20 print:border-zinc-300 print:bg-zinc-50 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold block">{task.title || `Practical Task: ${task.skill}`}</span>
                    <span className="text-[11px] text-muted-foreground print:text-zinc-600 font-mono">
                      Repo: {task.repositoryUrl}
                    </span>
                  </div>
                  <span className="font-bold text-foreground print:text-zinc-900">
                    {task.previousStatus} → {task.newStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Remaining Gaps */}
        {skillGaps.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground print:text-zinc-900">
              Identified Evidence Gaps
            </h2>
            <div className="space-y-1.5 text-xs">
              {skillGaps.map((gap) => (
                <div
                  key={gap.skill}
                  className="p-2.5 rounded border border-border/40 bg-background/40 print:border-zinc-200 print:bg-zinc-50 flex items-center justify-between"
                >
                  <span>
                    <strong>{gap.skill}</strong> ({gap.requirementType}): {gap.explanation}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-amber-400 print:text-amber-800">
                    {gap.priority} PRIORITY
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Disclaimer */}
        <div className="border-t border-border/60 pt-4 text-center text-[11px] text-muted-foreground print:text-zinc-500 print:border-zinc-300 space-y-1">
          <p className="font-medium">
            SkillProof Verification System · Observational GitHub Evidence Verification
          </p>
          <p>
            Verification reflects confirmed factual artifacts (source code, manifests, CI workflows, configurations) and does not represent subjective human evaluation.
          </p>
        </div>
      </div>
    </div>
  );
}
