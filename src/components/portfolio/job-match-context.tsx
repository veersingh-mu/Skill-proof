"use client";

import Link from "next/link";
import { BriefcaseBusiness, CheckCircle2, CircleAlert, CircleDashed } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JobMatchEvaluation, JobMatchResult } from "@/lib/jobs/types";

interface JobMatchContextProps {
  jobMatch?: JobMatchEvaluation | null;
}

function MatchStatusPill({ match }: { match: JobMatchResult }) {
  if (match.matchStatus === "VERIFIED_MATCH") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
        <CheckCircle2 className="size-2.5 text-emerald-400" />
        Verified Match
      </span>
    );
  }
  if (match.matchStatus === "PARTIAL_MATCH") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
        <CircleAlert className="size-2.5 text-amber-400" />
        Partial Match
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-300 border border-red-500/30">
      <CircleDashed className="size-2.5 text-red-400" />
      Evidence Gap
    </span>
  );
}

export function JobMatchContext({ jobMatch }: JobMatchContextProps) {
  if (!jobMatch || !jobMatch.matches || jobMatch.matches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-card/40 p-8 text-center space-y-2">
        <BriefcaseBusiness className="size-8 text-muted-foreground mx-auto" />
        <p className="text-sm font-semibold text-foreground">No job analysis available yet</p>
        <p className="text-xs text-muted-foreground">
          Compare your verified technical evidence against a real job description to identify role-specific matches and gaps.
        </p>
        <Button asChild size="sm" variant="outline" className="text-xs mt-2">
          <Link href="/jobs">Analyze a Job Description</Link>
        </Button>
      </div>
    );
  }

  const required = jobMatch.matches.filter((m) => m.requirementType === "REQUIRED");
  const preferred = jobMatch.matches.filter((m) => m.requirementType === "PREFERRED");

  return (
    <div className="rounded-xl border border-border/80 bg-card/60 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <BriefcaseBusiness className="size-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-foreground">
            Target Job Alignment: {jobMatch.job?.title || "Analyzed Position"}
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {jobMatch.metrics?.overallCoverage ?? 0}% overall requirements verified
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Required Skills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-foreground border-b border-border/40 pb-1.5">
            <span>Required Requirements ({required.length})</span>
            <span className="text-[11px] text-muted-foreground">
              {jobMatch.metrics?.requiredCoverage ?? 0}% verified
            </span>
          </div>
          <div className="space-y-1.5">
            {required.map((req) => (
              <div
                key={req.skill}
                className="p-2.5 rounded bg-background/50 border border-border/40 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-semibold text-foreground">{req.skill}</span>
                  <span className="block text-[11px] text-muted-foreground font-mono">
                    Score: {req.verificationScore}/100
                  </span>
                </div>
                <MatchStatusPill match={req} />
              </div>
            ))}
          </div>
        </div>

        {/* Preferred Skills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-foreground border-b border-border/40 pb-1.5">
            <span>Preferred Requirements ({preferred.length})</span>
            <span className="text-[11px] text-muted-foreground">
              {jobMatch.metrics?.preferredCoverage ?? 0}% verified
            </span>
          </div>
          <div className="space-y-1.5">
            {preferred.map((req) => (
              <div
                key={req.skill}
                className="p-2.5 rounded bg-background/50 border border-border/40 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-semibold text-foreground">{req.skill}</span>
                  <span className="block text-[11px] text-muted-foreground font-mono">
                    Score: {req.verificationScore}/100
                  </span>
                </div>
                <MatchStatusPill match={req} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
