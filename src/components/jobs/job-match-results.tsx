"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  CircleDashed,
  GitBranch,
  Network,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { JobMatchResult, MatchStatus, RequirementType } from "@/lib/jobs/types";
import { JobMatchDetail } from "./job-match-detail";

interface JobMatchResultsProps {
  matches: JobMatchResult[];
}

type FilterOption = "ALL" | MatchStatus | RequirementType;

export function JobMatchResults({ matches }: JobMatchResultsProps) {
  const [filter, setFilter] = useState<FilterOption>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>({});

  const toggleExpand = (skill: string) => {
    setExpandedSkills((prev) => ({
      ...prev,
      [skill]: !prev[skill],
    }));
  };

  const counts = useMemo(() => {
    let verified = 0;
    let partial = 0;
    let notVerified = 0;
    let required = 0;
    let preferred = 0;

    for (const m of matches) {
      if (m.matchStatus === "VERIFIED_MATCH") verified++;
      else if (m.matchStatus === "PARTIAL_MATCH") partial++;
      else notVerified++;

      if (m.requirementType === "REQUIRED") required++;
      else preferred++;
    }

    return {
      all: matches.length,
      verified,
      partial,
      notVerified,
      required,
      preferred,
    };
  }, [matches]);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // 1. Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSkill = m.skill.toLowerCase().includes(query);
        const matchesExpl = m.explanation.toLowerCase().includes(query);
        if (!matchesSkill && !matchesExpl) return false;
      }

      // 2. Filter category
      if (filter === "ALL") return true;
      if (filter === "VERIFIED_MATCH") return m.matchStatus === "VERIFIED_MATCH";
      if (filter === "PARTIAL_MATCH") return m.matchStatus === "PARTIAL_MATCH";
      if (filter === "NOT_VERIFIED") return m.matchStatus === "NOT_VERIFIED";
      if (filter === "REQUIRED") return m.requirementType === "REQUIRED";
      if (filter === "PREFERRED") return m.requirementType === "PREFERRED";
      return true;
    });
  }, [matches, filter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <h3 className="text-base font-bold text-foreground tracking-tight">
            Requirement Matching Results
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Trace every requirement to factual repository, dependency, and framework evidence.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search matched skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-8 bg-background/50 border-border/80"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 pb-1">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            filter === "ALL"
              ? "bg-foreground text-background font-semibold"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          All ({counts.all})
        </button>

        <button
          type="button"
          onClick={() => setFilter("VERIFIED_MATCH")}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
            filter === "VERIFIED_MATCH"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <span className="size-2 rounded-full bg-emerald-400" />
          Verified ({counts.verified})
        </button>

        <button
          type="button"
          onClick={() => setFilter("PARTIAL_MATCH")}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
            filter === "PARTIAL_MATCH"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <span className="size-2 rounded-full bg-amber-400" />
          Partial ({counts.partial})
        </button>

        <button
          type="button"
          onClick={() => setFilter("NOT_VERIFIED")}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
            filter === "NOT_VERIFIED"
              ? "bg-red-500/20 text-red-300 border border-red-500/40 font-semibold"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <span className="size-2 rounded-full bg-red-400" />
          Not Verified ({counts.notVerified})
        </button>

        <span className="text-border mx-1 self-center">|</span>

        <button
          type="button"
          onClick={() => setFilter("REQUIRED")}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            filter === "REQUIRED"
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Required Only ({counts.required})
        </button>

        <button
          type="button"
          onClick={() => setFilter("PREFERRED")}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            filter === "PREFERRED"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Preferred Only ({counts.preferred})
        </button>
      </div>

      {/* Match Cards List */}
      {filteredMatches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-card/40 p-8 text-center text-xs text-muted-foreground">
          No requirements match the selected filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map((m) => {
            const isExpanded = !!expandedSkills[m.skill];
            const hasEvidence = m.supportingEvidence.length > 0;

            const isVerified = m.matchStatus === "VERIFIED_MATCH";
            const isPartial = m.matchStatus === "PARTIAL_MATCH";

            return (
              <div
                key={m.skill}
                className={`rounded-xl border transition-colors ${
                  isVerified
                    ? "border-emerald-500/30 bg-card/60 hover:border-emerald-500/50"
                    : isPartial
                    ? "border-amber-500/30 bg-card/60 hover:border-amber-500/50"
                    : "border-border/70 bg-card/40 hover:border-border"
                } p-4 sm:p-5 shadow-sm space-y-3`}
              >
                {/* Top Row: Skill, Badges, Score */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-base font-bold text-foreground">
                      {m.skill}
                    </span>

                    {/* Requirement Type Badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                        m.requirementType === "REQUIRED"
                          ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                          : "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                      }`}
                    >
                      {m.requirementType}
                    </span>

                    {/* Match Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isVerified
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : isPartial
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          : "bg-secondary text-zinc-300 border border-border"
                      }`}
                    >
                      {isVerified ? (
                        <>
                          <CheckCircle2 className="size-3 text-emerald-400" />
                          <span>VERIFIED MATCH</span>
                        </>
                      ) : isPartial ? (
                        <>
                          <CircleAlert className="size-3 text-amber-400" />
                          <span>PARTIAL MATCH</span>
                        </>
                      ) : (
                        <>
                          <CircleDashed className="size-3 text-zinc-400" />
                          <span>EVIDENCE GAP</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Verification Score & Repository Count */}
                  <div className="flex items-center gap-2 text-xs font-mono self-start sm:self-auto">
                    {m.repositoryCount > 0 && (
                      <span className="text-muted-foreground flex items-center gap-1 bg-background/50 px-2 py-0.5 rounded border border-border/40">
                        <GitBranch className="size-3 text-emerald-400" />
                        {m.repositoryCount} repo{m.repositoryCount === 1 ? "" : "s"}
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded font-bold border ${
                        m.verificationScore >= 80
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                          : m.verificationScore > 0
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          : "bg-muted/40 text-muted-foreground border-border/40"
                      }`}
                    >
                      Score: {m.verificationScore}/100
                    </span>
                  </div>
                </div>

                {/* Explanation text */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {m.explanation}
                </p>

                {/* Bottom Row Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    {hasEvidence ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExpand(m.skill)}
                        className="text-xs h-7 border-border hover:bg-muted text-foreground"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="size-3 mr-1 text-muted-foreground" />
                            Hide Evidence
                          </>
                        ) : (
                          <>
                            <ChevronDown className="size-3 mr-1 text-muted-foreground" />
                            View Evidence ({m.supportingEvidence.length})
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-zinc-400 italic">
                          No qualifying evidence
                        </span>
                        <Button
                          asChild
                          size="sm"
                          className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                        >
                          <Link href={`/tasks?skill=${encodeURIComponent(m.skill)}`}>
                            Generate Task →
                          </Link>
                        </Button>
                      </div>
                    )}

                    {/* View in Evidence Graph Button */}
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 text-muted-foreground hover:text-indigo-300 hover:bg-indigo-500/10"
                    >
                      <Link href={`/evidence?skill=${encodeURIComponent(m.skill)}`}>
                        <Network className="size-3 mr-1 text-indigo-400" />
                        <span>View in Evidence Graph</span>
                      </Link>
                    </Button>
                  </div>

                  {m.sourceText && (
                    <span className="text-[11px] text-muted-foreground/70 truncate max-w-xs font-mono">
                      Source: &quot;{m.sourceText}&quot;
                    </span>
                  )}
                </div>

                {/* Expandable Supporting Evidence Detail */}
                {isExpanded && hasEvidence && (
                  <JobMatchDetail
                    skill={m.skill}
                    evidenceItems={m.supportingEvidence}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
