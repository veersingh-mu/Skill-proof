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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E7DCD1] pb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#241914] tracking-tight">
            Requirement Matching Results
          </h3>
          <p className="text-xs text-[#756B64] mt-0.5">
            Trace every requirement to factual repository, dependency, and framework evidence.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 size-3.5 text-[#756B64]" />
          <Input
            placeholder="Search matched skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9 bg-white border-[#E7DCD1] text-[#241914] rounded-xl focus-visible:ring-[#A95F3D]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 pb-1">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === "ALL"
              ? "bg-[#241914] text-white shadow-xs"
              : "bg-white border border-[#E7DCD1] text-[#756B64] hover:bg-[#FAF7F2] hover:text-[#241914]"
          }`}
        >
          All ({counts.all})
        </button>

        <button
          type="button"
          onClick={() => setFilter("VERIFIED_MATCH")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            filter === "VERIFIED_MATCH"
              ? "bg-[#2E8B57] text-white shadow-xs"
              : "bg-white border border-[#2E8B57]/30 text-[#2E8B57] hover:bg-[#E3F3E8]"
          }`}
        >
          <span className="size-2 rounded-full bg-[#2E8B57]" />
          Verified ({counts.verified})
        </button>

        <button
          type="button"
          onClick={() => setFilter("PARTIAL_MATCH")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            filter === "PARTIAL_MATCH"
              ? "bg-[#D99125] text-white shadow-xs"
              : "bg-white border border-[#D99125]/30 text-[#D99125] hover:bg-[#FFF0D7]"
          }`}
        >
          <span className="size-2 rounded-full bg-[#D99125]" />
          Partial ({counts.partial})
        </button>

        <button
          type="button"
          onClick={() => setFilter("NOT_VERIFIED")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            filter === "NOT_VERIFIED"
              ? "bg-[#756B64] text-white shadow-xs"
              : "bg-white border border-[#E7DCD1] text-[#756B64] hover:bg-[#FAF7F2]"
          }`}
        >
          <span className="size-2 rounded-full bg-[#756B64]" />
          Missing Evidence ({counts.notVerified})
        </button>

        <span className="text-[#E7DCD1] mx-1 self-center">|</span>

        <button
          type="button"
          onClick={() => setFilter("REQUIRED")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === "REQUIRED"
              ? "bg-[#A95F3D] text-white shadow-xs"
              : "bg-white border border-[#A95F3D]/30 text-[#A95F3D] hover:bg-[#F4E2D3]/40"
          }`}
        >
          Required Only ({counts.required})
        </button>

        <button
          type="button"
          onClick={() => setFilter("PREFERRED")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === "PREFERRED"
              ? "bg-[#6D351F] text-white shadow-xs"
              : "bg-white border border-[#E7DCD1] text-[#6D351F] hover:bg-[#FAF7F2]"
          }`}
        >
          Preferred Only ({counts.preferred})
        </button>
      </div>

      {/* Match Cards List */}
      {filteredMatches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E7DCD1] bg-white p-8 text-center text-xs text-[#756B64]">
          No requirements match the selected filter.
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredMatches.map((m) => {
            const isExpanded = !!expandedSkills[m.skill];
            const hasEvidence = m.supportingEvidence.length > 0;

            const isVerified = m.matchStatus === "VERIFIED_MATCH";
            const isPartial = m.matchStatus === "PARTIAL_MATCH";

            return (
              <div
                key={m.skill}
                className={`rounded-2xl border bg-white transition-all duration-200 ${
                  isVerified
                    ? "border-[#2E8B57]/30 hover:border-[#2E8B57]"
                    : isPartial
                    ? "border-[#D99125]/30 hover:border-[#D99125]"
                    : "border-[#E7DCD1] hover:border-[#A95F3D]/40"
                } p-5 sm:p-6 shadow-xs space-y-3.5`}
              >
                {/* Top Row: Skill, Badges, Score */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-base font-extrabold text-[#241914]">
                      {m.skill}
                    </span>

                    {/* Requirement Type Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                        m.requirementType === "REQUIRED"
                          ? "bg-[#F4E2D3] text-[#A95F3D] border border-[#E8C5B0]"
                          : "bg-[#FAF7F2] text-[#6D351F] border border-[#E7DCD1]"
                      }`}
                    >
                      {m.requirementType}
                    </span>

                    {/* Match Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-lg text-xs font-bold ${
                        isVerified
                          ? "bg-[#E3F3E8] text-[#2E8B57] border border-[#2E8B57]/30"
                          : isPartial
                          ? "bg-[#FFF0D7] text-[#D99125] border border-[#D99125]/30"
                          : "bg-[#FAF7F2] text-[#756B64] border border-[#E7DCD1]"
                      }`}
                    >
                      {isVerified ? (
                        <>
                          <CheckCircle2 className="size-3.5 text-[#2E8B57]" />
                          <span>✓ Verified</span>
                        </>
                      ) : isPartial ? (
                        <>
                          <CircleAlert className="size-3.5 text-[#D99125]" />
                          <span>◐ Partially Verified</span>
                        </>
                      ) : (
                        <>
                          <CircleDashed className="size-3.5 text-[#756B64]" />
                          <span>○ Evidence Missing</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Verification Score & Repository Count */}
                  <div className="flex items-center gap-2.5 text-xs font-mono self-start sm:self-auto">
                    {m.repositoryCount > 0 && (
                      <span className="text-[#756B64] flex items-center gap-1 bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#E7DCD1]">
                        <GitBranch className="size-3 text-[#A95F3D]" />
                        {m.repositoryCount} repo{m.repositoryCount === 1 ? "" : "s"}
                      </span>
                    )}

                    <span
                      className={`px-2.5 py-1 rounded-lg font-bold border ${
                        m.verificationScore >= 80
                          ? "bg-[#E3F3E8] text-[#2E8B57] border-[#2E8B57]/30"
                          : m.verificationScore > 0
                          ? "bg-[#FFF0D7] text-[#D99125] border-[#D99125]/30"
                          : "bg-[#FAF7F2] text-[#756B64] border-[#E7DCD1]"
                      }`}
                    >
                      Score: {m.verificationScore}/100
                    </span>
                  </div>
                </div>

                {/* Explanation text */}
                <p className="text-xs text-[#756B64] leading-relaxed">
                  {m.explanation}
                </p>

                {/* Bottom Row Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E7DCD1]">
                  <div className="flex flex-wrap items-center gap-2">
                    {hasEvidence ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExpand(m.skill)}
                        className="text-xs font-semibold h-8 min-h-[36px] border-[#E7DCD1] hover:bg-[#FAF7F2] text-[#241914] rounded-xl"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="size-3 mr-1 text-[#756B64]" />
                            Hide Evidence
                          </>
                        ) : (
                          <>
                            <ChevronDown className="size-3 mr-1 text-[#756B64]" />
                            View Evidence ({m.supportingEvidence.length})
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-[#756B64] italic">
                          No qualifying evidence
                        </span>
                        <Button
                          asChild
                          size="sm"
                          className="text-xs font-bold bg-[#A95F3D] hover:bg-[#8E4F32] text-white h-8 min-h-[36px] rounded-xl shadow-xs"
                        >
                          <Link href="/tasks">
                            Generate Verification Task
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-xs font-semibold text-[#A95F3D] hover:text-[#8E4F32] hover:bg-[#F4E2D3]/40 rounded-xl"
                  >
                    <Link href="/evidence">
                      <Network className="size-3 mr-1" />
                      View in Graph
                    </Link>
                  </Button>
                </div>

                {/* Expanded Evidence Trail */}
                {isExpanded && (
                  <div className="pt-2">
                    <JobMatchDetail
                      skill={m.skill}
                      evidenceItems={m.supportingEvidence}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
