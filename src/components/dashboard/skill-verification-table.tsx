"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, CheckCircle2, CircleAlert, CircleDashed, Filter, Layers, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { SkillVerificationResult } from "@/lib/evidence";
import type { SkillStatus } from "@/types";
import { SkillVerificationCard } from "./skill-verification-card";

interface SkillVerificationTableProps {
  verifications: SkillVerificationResult[];
}

type FilterOption = "ALL" | SkillStatus;
type SortOption =
  | "NAME_ASC"
  | "NAME_DESC"
  | "SCORE_DESC"
  | "EVIDENCE_DESC"
  | "REPOS_DESC"
  | "STATUS";

const STATUS_PRIORITY: Record<SkillStatus, number> = {
  PROVEN: 1,
  PARTIAL: 2,
  CLAIMED_ONLY: 3,
};

export function SkillVerificationTable({ verifications }: SkillVerificationTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterOption>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("STATUS");

  // Dynamic filter counts
  const counts = useMemo(() => {
    let proven = 0;
    let partial = 0;
    let claimed = 0;

    for (const v of verifications) {
      if (v.status === "PROVEN") proven++;
      else if (v.status === "PARTIAL") partial++;
      else claimed++;
    }

    return {
      all: verifications.length,
      proven,
      partial,
      claimed,
    };
  }, [verifications]);

  // Filter and sort deterministically
  const filteredAndSorted = useMemo(() => {
    let list = [...verifications];

    // 1. Filter by status
    if (activeFilter !== "ALL") {
      list = list.filter((v) => v.status === activeFilter);
    }

    // 2. Filter by search query
    const query = searchQuery.trim().toLowerCase();
    if (query.length > 0) {
      list = list.filter((v) => {
        return (
          v.skill.toLowerCase().includes(query) ||
          v.reason.toLowerCase().includes(query) ||
          (v.distinctSignalTypes && v.distinctSignalTypes.some((s) => s.toLowerCase().includes(query)))
        );
      });
    }

    // 3. Sort deterministically
    list.sort((a, b) => {
      switch (sortBy) {
        case "NAME_ASC":
          return a.skill.localeCompare(b.skill);
        case "NAME_DESC":
          return b.skill.localeCompare(a.skill);
        case "SCORE_DESC":
          return b.evidenceScore - a.evidenceScore || a.skill.localeCompare(b.skill);
        case "EVIDENCE_DESC":
          return b.evidenceItems.length - a.evidenceItems.length || a.skill.localeCompare(b.skill);
        case "REPOS_DESC":
          return (b.repositoryCount ?? 0) - (a.repositoryCount ?? 0) || a.skill.localeCompare(b.skill);
        case "STATUS":
        default:
          return (
            STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status] ||
            b.evidenceScore - a.evidenceScore ||
            a.skill.localeCompare(b.skill)
          );
      }
    });

    return list;
  }, [verifications, activeFilter, searchQuery, sortBy]);

  return (
    <section aria-label="Skill Verifications" className="space-y-5">
      {/* Control Bar: Filters, Search, Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Pills (Requirement 5) */}
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter skills by status">
          <Button
            variant={activeFilter === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("ALL")}
            className={`text-xs h-8 px-3 rounded-lg ${
              activeFilter === "ALL"
                ? "bg-foreground text-background font-semibold"
                : "border-border/80 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="size-3 mr-1.5" />
            All Skills ({counts.all})
          </Button>

          <Button
            variant={activeFilter === "PROVEN" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("PROVEN")}
            className={`text-xs h-8 px-3 rounded-lg ${
              activeFilter === "PROVEN"
                ? "bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
                : "border-emerald-400/30 text-emerald-300/80 hover:text-emerald-300 hover:bg-emerald-400/10"
            }`}
          >
            <CheckCircle2 className="size-3 mr-1.5" />
            Proven ({counts.proven})
          </Button>

          <Button
            variant={activeFilter === "PARTIAL" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("PARTIAL")}
            className={`text-xs h-8 px-3 rounded-lg ${
              activeFilter === "PARTIAL"
                ? "bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                : "border-amber-400/30 text-amber-300/80 hover:text-amber-300 hover:bg-amber-400/10"
            }`}
          >
            <CircleAlert className="size-3 mr-1.5" />
            Partial ({counts.partial})
          </Button>

          <Button
            variant={activeFilter === "CLAIMED_ONLY" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("CLAIMED_ONLY")}
            className={`text-xs h-8 px-3 rounded-lg ${
              activeFilter === "CLAIMED_ONLY"
                ? "bg-zinc-300 hover:bg-zinc-200 text-black font-semibold"
                : "border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            <CircleDashed className="size-3 mr-1.5" />
            Claimed-Only ({counts.claimed})
          </Button>
        </div>

        {/* Search and Sort Dropdown (Requirements 6 & 7) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Field */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills..."
              aria-label="Search skills"
              className="h-8 pl-8 pr-3 text-xs bg-card/60 border-border/80 rounded-lg w-full"
            />
          </div>

          {/* Deterministic Sort Select */}
          <div className="flex items-center gap-1.5 shrink-0">
            <ArrowDownUp className="size-3.5 text-muted-foreground" />
            <select
              aria-label="Sort skills"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-8 rounded-lg border border-border/80 bg-card/90 px-2.5 text-xs text-foreground font-medium outline-none focus:ring-1 focus:ring-emerald-400"
            >
              <option value="STATUS">Sort: Status (Proven first)</option>
              <option value="SCORE_DESC">Sort: Evidence score (High-Low)</option>
              <option value="EVIDENCE_DESC">Sort: Evidence count (High-Low)</option>
              <option value="REPOS_DESC">Sort: Repository count (High-Low)</option>
              <option value="NAME_ASC">Sort: Skill name (A-Z)</option>
              <option value="NAME_DESC">Sort: Skill name (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Skills List / Empty State */}
      {filteredAndSorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-card/30 p-12 text-center space-y-3">
          <Filter className="size-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">No matching skills found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? `No skills matched "${searchQuery}" in the ${activeFilter} category.`
              : "No skills match the selected filter."}
          </p>
          {(searchQuery || activeFilter !== "ALL") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("ALL");
              }}
              className="text-xs mt-2"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSorted.map((verification) => (
            <SkillVerificationCard
              key={verification.skill}
              verification={verification}
              defaultExpanded={filteredAndSorted.length === 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}
