"use client";

import { CheckCircle2, CircleAlert, CircleDashed, Info } from "lucide-react";

export function StatusExplanation() {
  return (
    <div className="rounded-xl border border-border/80 bg-card/50 p-5 space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground uppercase tracking-wider">
        <Info className="size-4 text-muted-foreground" />
        <h3>Status Definitions & Rationale</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PROVEN */}
        <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.04] p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              PROVEN
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Strong direct technical evidence was found across repository code, dependencies, package manifests, or test suites.
          </p>
        </div>

        {/* PARTIAL */}
        <div className="rounded-lg border border-amber-400/20 bg-amber-400/[0.04] p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CircleAlert className="size-4 text-amber-400 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              PARTIAL
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Some supporting evidence was found, but it does not meet the PROVEN requirements (e.g. single repository, commits only, or documentation references).
          </p>
        </div>

        {/* CLAIMED-ONLY */}
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CircleDashed className="size-4 text-zinc-400 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              CLAIMED-ONLY
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The resume claims this skill, but sufficient public GitHub evidence was not found.
          </p>
        </div>
      </div>

      <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground leading-relaxed">
        <span className="font-semibold text-foreground">Important:</span> CLAIMED-ONLY does <strong>NOT</strong> mean the candidate lacks the skill. It only means sufficient verifiable public GitHub evidence was not found in their analyzed public repositories. Private enterprise experience and unindexed work are not captured.
      </div>
    </div>
  );
}
