"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
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
      <div className="py-20 text-center text-xs text-[#756B64]">
        Generating SkillProof Report...
      </div>
    );
  }

  const { candidate, summary, skills, verificationHistory, tasks, skillGaps } = portfolio;
  const verificationId = `SKP-${(candidate.githubUsername || "CANDIDATE").toUpperCase().slice(0, 6)}-${(portfolio.generatedAt || "20261002").replace(/-/g, "").slice(0, 8)}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 print:p-0 print:m-0 print:max-w-none">
      {/* Top action bar (hidden in print) */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Button asChild variant="outline" size="sm" className="text-xs h-9 font-semibold border-[#E7DCD1] text-[#241914] hover:bg-[#FAF7F2] rounded-xl">
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
            className="bg-[#A95F3D] text-white hover:bg-[#8E4F32] font-bold text-xs h-9 px-4 rounded-xl shadow-xs"
          >
            <Printer className="size-3.5 mr-1.5" />
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Printable Report Document */}
      <div className="rounded-2xl border border-[#E7DCD1] bg-white p-8 sm:p-12 space-y-8 shadow-sm print:border-none print:p-0 print:bg-white print:text-zinc-950">
        {/* Document Header */}
        <div className="border-b border-[#E7DCD1] pb-6 space-y-4 print:border-zinc-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-[#A95F3D] print:text-[#A95F3D]">
              <div className="flex size-7 items-center justify-center rounded-lg bg-[#F4E2D3] text-[#A95F3D]">
                <ShieldCheck className="size-4" />
              </div>
              SKILLPROOF VERIFICATION
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#756B64] print:text-zinc-500 font-semibold" suppressHydrationWarning>
                Verification ID: <strong className="text-[#241914]">{verificationId}</strong>
              </span>
              <span className="hidden sm:inline text-[#E7DCD1]">|</span>
              <span className="text-xs text-[#756B64] print:text-zinc-500 font-mono" suppressHydrationWarning>
                Generated {portfolio.generatedAt ? portfolio.generatedAt.slice(0, 10) : new Date().toISOString().slice(0, 10)}
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#241914] print:text-zinc-900">
              Verified Technical Skill Report
            </h1>
            <p className="text-xs text-[#756B64] print:text-zinc-600 mt-1 italic">
              &ldquo;Don&apos;t just claim skills. Prove them.&rdquo; — Verification is based strictly on observable technical evidence.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-[#E7DCD1]/60" suppressHydrationWarning>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="font-bold text-[#241914] print:text-zinc-900" suppressHydrationWarning>
                Candidate: {candidate.name}
              </span>
              {candidate.githubUsername && (
                <span className="text-[#756B64] print:text-zinc-600 font-mono" suppressHydrationWarning>
                  GitHub: @{candidate.githubUsername}
                </span>
              )}
              {candidate.email && (
                <span className="text-[#756B64] print:text-zinc-600">
                  Email: {candidate.email}
                </span>
              )}
            </div>

            <div className="print:hidden">
              <Button asChild size="sm" variant="outline" className="text-xs font-bold border-[#2E8B57]/40 text-[#2E8B57] bg-[#E3F3E8]/40 hover:bg-[#E3F3E8] rounded-lg h-7">
                <Link href="/dashboard">
                  <CheckCircle2 className="size-3 mr-1 text-[#2E8B57]" />
                  Verify Report
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Executive Verification Summary */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#A95F3D] print:text-zinc-900">
            Executive Evidence Summary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl border border-[#E7DCD1] bg-[#FAF7F2] print:border-zinc-300 print:bg-zinc-50">
              <span className="text-[10px] uppercase font-bold text-[#756B64] print:text-zinc-600 block">
                Skills Analyzed
              </span>
              <span className="text-2xl font-extrabold font-mono text-[#241914] print:text-zinc-900">
                {summary.claimedSkillsCount}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-[#2E8B57]/30 bg-[#E3F3E8]/50 print:border-zinc-300 print:bg-zinc-50">
              <span className="text-[10px] uppercase font-bold text-[#2E8B57] print:text-emerald-700 block">
                Verified
              </span>
              <span className="text-2xl font-extrabold font-mono text-[#2E8B57] print:text-emerald-800">
                {summary.provenCount}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-[#D99125]/30 bg-[#FFF0D7]/50 print:border-zinc-300 print:bg-zinc-50">
              <span className="text-[10px] uppercase font-bold text-[#D99125] print:text-amber-700 block">
                Partial
              </span>
              <span className="text-2xl font-extrabold font-mono text-[#D99125] print:text-amber-800">
                {summary.partialCount}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-[#E7DCD1] bg-[#FAF7F2] print:border-zinc-300 print:bg-zinc-50">
              <span className="text-[10px] uppercase font-bold text-[#756B64] print:text-zinc-600 block">
                Insufficient
              </span>
              <span className="text-2xl font-extrabold font-mono text-[#756B64] print:text-zinc-900">
                {summary.insufficientCount}
              </span>
            </div>
          </div>
        </div>

        {/* Skill Matrix Table */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#A95F3D] print:text-zinc-900">
            Skill Verification Matrix
          </h2>
          <div className="border border-[#E7DCD1] rounded-xl overflow-x-auto print:border-zinc-300 print:overflow-visible">
            <table className="w-full text-left text-xs min-w-[580px] sm:min-w-0">
              <thead className="bg-[#FAF7F2] border-b border-[#E7DCD1] print:bg-zinc-100 print:border-zinc-300 font-bold text-[#756B64] print:text-zinc-700">
                <tr>
                  <th className="py-3 px-3.5">Skill</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5">Score</th>
                  <th className="py-3 px-3.5">Evidence Signals</th>
                  <th className="py-3 px-3.5">Deterministic Verification Finding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCD1] print:divide-zinc-200">
                {skills.map((s) => (
                  <tr key={s.skill} className="print:text-zinc-900 hover:bg-[#FAF7F2]/50 transition-colors">
                    <td className="py-3 px-3.5 font-bold text-[#241914]">{s.skill}</td>
                    <td className="py-3 px-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        s.status === "PROVEN"
                          ? "bg-[#E3F3E8] text-[#2E8B57] border border-[#2E8B57]/30 print:bg-emerald-100 print:text-emerald-900"
                          : s.status === "PARTIAL"
                          ? "bg-[#FFF0D7] text-[#D99125] border border-[#D99125]/30 print:bg-amber-100 print:text-amber-900"
                          : "bg-[#FAF7F2] text-[#756B64] border border-[#E7DCD1] print:bg-zinc-100 print:text-zinc-900"
                      }`}>
                        {s.status === "PROVEN" ? "VERIFIED" : s.status === "PARTIAL" ? "PARTIAL" : "INSUFFICIENT"}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-mono font-bold text-[#241914]">{s.evidenceScore}/100</td>
                    <td className="py-3 px-3.5 text-[#756B64] print:text-zinc-600 font-medium">
                      {s.evidenceCount} {s.evidenceCount === 1 ? "signal" : "signals"} ({s.repositoryCount} {s.repositoryCount === 1 ? "repo" : "repos"})
                    </td>
                    <td className="py-3 px-3.5 text-[#756B64] print:text-zinc-700 text-[11px] leading-relaxed">
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#A95F3D] print:text-zinc-900">
            Technical Evidence Breakdown
          </h2>

          <div className="space-y-3.5">
            {skills.filter((s) => s.evidenceItems.length > 0).map((s) => (
              <div key={s.skill} className="p-4 sm:p-5 rounded-xl border border-[#E7DCD1] bg-[#FAF7F2] print:border-zinc-300 print:bg-zinc-50 space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#E7DCD1] pb-2 print:border-zinc-200">
                  <span className="font-bold text-sm text-[#241914] print:text-zinc-900">
                    {s.skill} Evidence Signals ({s.evidenceItems.length})
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#A95F3D] print:text-zinc-600">
                    Score: {s.evidenceScore}/100
                  </span>
                </div>

                <div className="space-y-2">
                  {s.evidenceItems.map((ev, i) => (
                    <div key={ev.id || i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[#241914] print:text-zinc-800 font-bold">
                          ✓ {ev.extractedFact}
                        </span>
                        {ev.filePath && (
                          <span className="text-[11px] text-[#756B64] print:text-zinc-500 font-mono block pl-3 break-all">
                            Path: {ev.filePath} ({ev.repositoryName})
                          </span>
                        )}
                      </div>
                      {ev.sourceUrl && (
                        <a
                          href={ev.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#A95F3D] print:text-emerald-700 hover:underline text-[11px] shrink-0 font-semibold"
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#A95F3D] print:text-zinc-900">
              Proof Transitions (Before vs. After Work)
            </h2>
            <div className="space-y-3">
              {verificationHistory.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-xl border border-[#2E8B57]/30 bg-[#E3F3E8]/40 print:border-zinc-300 print:bg-zinc-50 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-[#241914]">
                    <span>{item.skill}: {item.previousStatus} ({item.previousScore}) → {item.newStatus} ({item.newScore})</span>
                    {item.scoreDelta > 0 && (
                      <span className="text-[#2E8B57] font-bold">+{item.scoreDelta} points</span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#756B64] print:text-zinc-600 font-mono">
                    Repository: {item.repositoryUrl}
                  </div>
                  {item.reasons.map((r, rIdx) => (
                    <div key={rIdx} className="text-[11px] text-[#756B64] print:text-zinc-700 font-medium">• {r}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Practical Tasks */}
        {tasks.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#A95F3D] print:text-zinc-900">
              Completed Practical Tasks
            </h2>
            <div className="space-y-2 text-xs">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl border border-[#E7DCD1] bg-[#FAF7F2] print:border-zinc-300 print:bg-zinc-50 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-[#241914] block">{task.title || `Practical Task: ${task.skill}`}</span>
                    <span className="text-[11px] text-[#756B64] print:text-zinc-600 font-mono">
                      Repo: {task.repositoryUrl}
                    </span>
                  </div>
                  <span className="font-bold text-[#2E8B57] print:text-zinc-900">
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#A95F3D] print:text-zinc-900">
              Identified Evidence Gaps
            </h2>
            <div className="space-y-1.5 text-xs">
              {skillGaps.map((gap) => (
                <div
                  key={gap.skill}
                  className="p-3 rounded-xl border border-[#E7DCD1] bg-[#FAF7F2] print:border-zinc-200 print:bg-zinc-50 flex items-center justify-between"
                >
                  <span className="text-[#241914]">
                    <strong>{gap.skill}</strong> ({gap.requirementType}): <span className="text-[#756B64]">{gap.explanation}</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase text-[#D99125] print:text-amber-800">
                    {gap.priority} PRIORITY
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Disclaimer */}
        <div className="border-t border-[#E7DCD1] pt-6 text-center text-[11px] text-[#756B64] print:text-zinc-500 print:border-zinc-300 space-y-1">
          <p className="font-bold text-[#241914]">
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
