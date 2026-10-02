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
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter skills by status">
          <Button
            variant={activeFilter === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("ALL")}
            className={`text-xs h-9 px-3.5 rounded-xl transition-all ${
              activeFilter === "ALL"
                ? "bg-[#241914] text-white font-bold shadow-xs hover:bg-[#3D2C24]"
                : "border-[#E7DCD1] bg-white text-[#756B64] hover:text-[#241914] hover:bg-[#FAF7F2]"
            }`}
          >
            <Layers className="size-3.5 mr-1.5" />
            All Skills ({counts.all})
          </Button>

          <Button
            variant={activeFilter === "PROVEN" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("PROVEN")}
            className={`text-xs h-9 px-3.5 rounded-xl transition-all ${
              activeFilter === "PROVEN"
                ? "bg-[#2E8B57] hover:bg-[#236B43] text-white font-bold shadow-xs"
                : "border-[#2E8B57]/30 bg-white text-[#2E8B57] hover:bg-[#E3F3E8]"
            }`}
          >
            <CheckCircle2 className="size-3.5 mr-1.5" />
            Verified ({counts.proven})
          </Button>

          <Button
            variant={activeFilter === "PARTIAL" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("PARTIAL")}
            className={`text-xs h-9 px-3.5 rounded-xl transition-all ${
              activeFilter === "PARTIAL"
                ? "bg-[#D99125] hover:bg-[#B87A1E] text-white font-bold shadow-xs"
                : "border-[#D99125]/30 bg-white text-[#D99125] hover:bg-[#FFF0D7]"
            }`}
          >
            <CircleAlert className="size-3.5 mr-1.5" />
            Partial ({counts.partial})
          </Button>

          <Button
            variant={activeFilter === "CLAIMED_ONLY" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("CLAIMED_ONLY")}
            className={`text-xs h-9 px-3.5 rounded-xl transition-all ${
              activeFilter === "CLAIMED_ONLY"
                ? "bg-[#756B64] hover:bg-[#5C544E] text-white font-bold shadow-xs"
                : "border-[#E7DCD1] bg-white text-[#756B64] hover:text-[#241914] hover:bg-[#FAF7F2]"
            }`}
          >
            <CircleDashed className="size-3.5 mr-1.5" />
            Insufficient ({counts.claimed})
          </Button>
        </div>

        {/* Search and Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Field */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#756B64]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills..."
              aria-label="Search skills"
              className="h-9 pl-9 pr-3 text-xs bg-white border-[#E7DCD1] text-[#241914] placeholder-[#756B64] rounded-xl w-full focus-visible:ring-[#A95F3D]"
            />
          </div>

          {/* Deterministic Sort Select */}
          <div className="flex items-center gap-1.5 shrink-0">
            <ArrowDownUp className="size-3.5 text-[#756B64]" />
            <select
              aria-label="Sort skills"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-9 rounded-xl border border-[#E7DCD1] bg-white px-3 text-xs text-[#241914] font-semibold outline-none focus:ring-1 focus:ring-[#A95F3D] shadow-2xs"
            >
              <option value="STATUS">Sort: Status (Verified first)</option>
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
        <div className="rounded-2xl border border-dashed border-[#E7DCD1] bg-white p-12 text-center space-y-3">
          <Filter className="size-8 text-[#756B64] mx-auto" />
          <h3 className="text-sm font-bold text-[#241914]">No matching skills found</h3>
          <p className="text-xs text-[#756B64] max-w-sm mx-auto">
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
              className="text-xs font-semibold mt-2 border-[#E7DCD1] text-[#241914] rounded-xl"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
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
