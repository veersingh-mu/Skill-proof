"use client";

import { useMemo, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { GapPriority, GapType, SkillGapAnalysis } from "@/lib/gaps/types";
import type { RequirementType } from "@/lib/jobs/types";
import { GapItemCard } from "./gap-item-card";

interface GapListProps {
  analysis: SkillGapAnalysis;
}

type FilterOption = "ALL" | GapType | GapPriority | RequirementType;

export function GapList({ analysis }: GapListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const allItems = analysis.all;

  const counts = useMemo(() => {
    let evidenceGaps = 0;
    let partialGaps = 0;
    let verified = 0;
    let high = 0;
    let required = 0;
    let preferred = 0;

    for (const item of allItems) {
      if (item.gapType === "EVIDENCE_GAP") evidenceGaps++;
      else if (item.gapType === "PARTIAL") partialGaps++;
      else verified++;

      if (item.priority === "HIGH") high++;
      if (item.requirementType === "REQUIRED") required++;
      else preferred++;
    }

    return {
      all: allItems.length,
      evidenceGaps,
      partialGaps,
      verified,
      high,
      required,
      preferred,
    };
  }, [allItems]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // 1. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSkill = item.skill.toLowerCase().includes(query);
        const matchesExpl = item.explanation.toLowerCase().includes(query);
        if (!matchesSkill && !matchesExpl) return false;
      }

      // 2. Active filter tab
      if (activeFilter === "ALL") return true;
      if (activeFilter === "EVIDENCE_GAP") return item.gapType === "EVIDENCE_GAP";
      if (activeFilter === "PARTIAL") return item.gapType === "PARTIAL";
      if (activeFilter === "NONE") return item.gapType === "NONE";
      if (activeFilter === "HIGH") return item.priority === "HIGH";
      if (activeFilter === "REQUIRED") return item.requirementType === "REQUIRED";
      if (activeFilter === "PREFERRED") return item.requirementType === "PREFERRED";
      return true;
    });
  }, [allItems, activeFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <h3 className="text-base font-bold text-foreground tracking-tight">
            Skill Gap Analysis & Prioritization
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Identify exact evidence gaps required to satisfy this job&apos;s technical requirements.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search skill gaps..."
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
          onClick={() => setActiveFilter("ALL")}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            activeFilter === "ALL"
              ? "bg-foreground text-background font-semibold"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          All Requirements ({counts.all})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("HIGH")}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeFilter === "HIGH"
              ? "bg-red-500/25 text-red-200 border border-red-500/50 font-semibold"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <AlertCircle className="size-3 text-red-400" />
          High Priority ({counts.high})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("EVIDENCE_GAP")}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeFilter === "EVIDENCE_GAP"
              ? "bg-red-500/20 text-red-300 border border-red-500/40 font-semibold"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <span className="size-2 rounded-full bg-red-400" />
          Evidence Gaps ({counts.evidenceGaps})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("PARTIAL")}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeFilter === "PARTIAL"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <AlertTriangle className="size-3 text-amber-400" />
          Partial Gaps ({counts.partialGaps})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("NONE")}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeFilter === "NONE"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <CheckCircle2 className="size-3 text-emerald-400" />
          Verified ({counts.verified})
        </button>

        <span className="text-border mx-1 self-center">|</span>

        <button
          type="button"
          onClick={() => setActiveFilter("REQUIRED")}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            activeFilter === "REQUIRED"
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Required ({counts.required})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("PREFERRED")}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            activeFilter === "PREFERRED"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Preferred ({counts.preferred})
        </button>
      </div>

      {/* Gap Cards List */}
      {filteredItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-card/40 p-8 text-center text-xs text-muted-foreground">
          No requirements match the selected filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <GapItemCard key={item.skill} gap={item} />
          ))}
        </div>
      )}
    </div>
  );
}
