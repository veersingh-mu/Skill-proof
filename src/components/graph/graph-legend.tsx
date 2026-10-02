"use client";

import { CheckCircle2, CircleAlert, CircleDashed, Info } from "lucide-react";

export function GraphLegend() {
  return (
    <div className="rounded-xl border border-border/80 bg-card/90 p-3.5 backdrop-blur-md shadow-md text-xs space-y-3">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
        <Info className="size-3.5" />
        <span>Evidence Graph Legend</span>
      </div>

      {/* Node Types */}
      <div className="space-y-1.5">
        <p className="text-[10px] uppercase font-bold text-muted-foreground">Node Pipeline</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400" /> Candidate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-slate-400" /> Resume Claim
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-foreground" /> Verified Skill
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-blue-400" /> GitHub Repository
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-sky-400" /> Evidence Signal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-purple-400" /> Artifact (File/Commit)
          </span>
        </div>
      </div>

      {/* Verification Statuses */}
      <div className="space-y-1.5 border-t border-border/50 pt-2">
        <p className="text-[10px] uppercase font-bold text-muted-foreground">Status Indicators</p>
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400 font-mono">
            <CheckCircle2 className="size-3" /> PROVEN
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-mono">
            <CircleAlert className="size-3" /> PARTIAL
          </span>
          <span className="flex items-center gap-1 text-red-400 font-mono">
            <CircleDashed className="size-3" /> CLAIMED-ONLY
          </span>
        </div>
      </div>

      {/* Edge Relationships */}
      <div className="space-y-1.5 border-t border-border/50 pt-2">
        <p className="text-[10px] uppercase font-bold text-muted-foreground">Edge Relationships</p>
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="inline-block w-4 h-0.5 bg-emerald-400" /> Direct supporting evidence
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block w-4 h-0.5 border-b border-dashed border-amber-400" /> Weak / indirect signal
          </span>
        </div>
      </div>
    </div>
  );
}
