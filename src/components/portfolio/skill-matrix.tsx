"use client";

import { CheckCircle2, CircleAlert, CircleDashed, FileCode2, Layers } from "lucide-react";
import type { SkillPortfolioItem } from "@/lib/portfolio/types";
import type { SkillStatus } from "@/types";

interface SkillMatrixProps {
  skills: SkillPortfolioItem[];
  selectedSkill: SkillPortfolioItem | null;
  onSelectSkill: (skill: SkillPortfolioItem) => void;
}

function StatusBadge({ status }: { status: SkillStatus }) {
  if (status === "PROVEN") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
        <CheckCircle2 className="size-3 text-emerald-400" />
        PROVEN
      </span>
    );
  }
  if (status === "PARTIAL") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
        <CircleAlert className="size-3 text-amber-400" />
        PARTIAL
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-secondary text-zinc-300 border border-border">
      <CircleDashed className="size-3 text-zinc-400" />
      CLAIMED ONLY
    </span>
  );
}

export function SkillMatrix({ skills, selectedSkill, onSelectSkill }: SkillMatrixProps) {
  if (skills.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl border border-dashed border-border/80 bg-card/40 text-muted-foreground text-xs">
        No skills evaluated in the current session.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card/60 overflow-hidden">
      <div className="p-4 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-foreground">Skill Proof Matrix</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {skills.length} claimed skills · Click to inspect evidence
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-4">Skill</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Deterministic Score</th>
              <th className="py-3 px-4">Evidence</th>
              <th className="py-3 px-4">Repositories</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {skills.map((item) => {
              const isSelected = selectedSkill?.skill === item.skill;
              return (
                <tr
                  key={item.skill}
                  onClick={() => onSelectSkill(item)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-emerald-500/[0.08]"
                      : "hover:bg-muted/40"
                  }`}
                >
                  <td className="py-3 px-4 font-semibold text-foreground">
                    <div className="flex items-center gap-2">
                      {item.hasBeforeAfterHistory && (
                        <span className="size-2 rounded-full bg-emerald-400" title="Re-verified via task submission" />
                      )}
                      <span>{item.skill}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 max-w-[140px]">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.status === "PROVEN"
                              ? "bg-emerald-400"
                              : item.status === "PARTIAL"
                              ? "bg-amber-400"
                              : "bg-red-400"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, item.evidenceScore))}%` }}
                        />
                      </div>
                      <span className="font-mono text-muted-foreground text-[11px]">
                        {item.evidenceScore}/100
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <FileCode2 className="size-3.5 text-muted-foreground" />
                      <span>{item.evidenceCount} {item.evidenceCount === 1 ? "item" : "items"}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    <span>{item.repositoryCount} {item.repositoryCount === 1 ? "repo" : "repos"}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-[11px] font-medium ${isSelected ? "text-emerald-400" : "text-muted-foreground hover:text-foreground"}`}>
                      {isSelected ? "Inspecting" : "Inspect →"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
