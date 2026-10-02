"use client";

import { CheckCircle2, CircleAlert, CircleDashed, Info } from "lucide-react";

export function StatusExplanation() {
  return (
    <div className="rounded-2xl border border-[#E7DCD1] bg-white p-6 sm:p-7 shadow-xs space-y-5">
      <div className="flex items-center gap-2 text-xs font-bold text-[#A95F3D] uppercase tracking-wider">
        <Info className="size-4 text-[#A95F3D]" />
        <h3>Status Definitions & Deterministic Scoring Rationale</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PROVEN */}
        <div className="rounded-xl border border-[#2E8B57]/30 bg-[#E3F3E8]/60 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-[#2E8B57] shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2E8B57]">
              VERIFIED
            </span>
          </div>
          <p className="text-xs text-[#241914]/80 leading-relaxed">
            Strong direct technical evidence was found across repository code, dependencies, package manifests, or test suites.
          </p>
        </div>

        {/* PARTIAL */}
        <div className="rounded-xl border border-[#D99125]/30 bg-[#FFF0D7]/60 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CircleAlert className="size-4 text-[#D99125] shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#D99125]">
              PARTIAL
            </span>
          </div>
          <p className="text-xs text-[#241914]/80 leading-relaxed">
            Some supporting evidence was found, but it does not meet strict verified criteria (e.g. single repository, commits only, or documentation references).
          </p>
        </div>

        {/* CLAIMED-ONLY / INSUFFICIENT */}
        <div className="rounded-xl border border-[#E7DCD1] bg-[#FAF7F2] p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CircleDashed className="size-4 text-[#756B64] shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#756B64]">
              INSUFFICIENT EVIDENCE
            </span>
          </div>
          <p className="text-xs text-[#756B64] leading-relaxed">
            The resume claims this skill, but sufficient public GitHub evidence was not detected.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[#E7DCD1] bg-[#FAF7F2] p-3.5 text-xs text-[#756B64] leading-relaxed">
        <strong className="text-[#241914]">Important:</strong> Insufficient Evidence does <strong>NOT</strong> mean the candidate lacks the skill. It only means sufficient verifiable public GitHub evidence was not found in their analyzed public repositories. Private enterprise experience and unindexed work are not captured.
      </div>
    </div>
  );
}
