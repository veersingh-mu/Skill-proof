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
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-[#E3F3E8] text-[#2E8B57] border border-[#2E8B57]/30">
        <CheckCircle2 className="size-3 text-[#2E8B57]" />
        VERIFIED
      </span>
    );
  }
  if (status === "PARTIAL") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-[#FFF0D7] text-[#D99125] border border-[#D99125]/30">
        <CircleAlert className="size-3 text-[#D99125]" />
        PARTIAL
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-[#FAF7F2] text-[#756B64] border border-[#E7DCD1]">
      <CircleDashed className="size-3 text-[#756B64]" />
      INSUFFICIENT
    </span>
  );
}

export function SkillMatrix({ skills, selectedSkill, onSelectSkill }: SkillMatrixProps) {
  if (skills.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl border border-dashed border-[#E7DCD1] bg-white text-[#756B64] text-xs">
        No skills evaluated in the current session.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E7DCD1] bg-white shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-[#E7DCD1] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-[#A95F3D]" />
          <h3 className="text-sm font-bold text-[#241914]">Skill Proof Matrix</h3>
        </div>
        <span className="text-xs text-[#756B64]">
          {skills.length} claimed skills · Click to inspect evidence
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[580px] sm:min-w-0">
          <thead className="bg-[#FAF7F2] border-b border-[#E7DCD1] text-[#756B64] text-[11px] uppercase tracking-wider font-bold">
            <tr>
              <th className="py-3 px-4">Skill</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Score</th>
              <th className="py-3 px-4">Evidence</th>
              <th className="py-3 px-4">Repositories</th>
              <th className="py-3 px-4 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7DCD1]">
            {skills.map((item) => {
              const isSelected = selectedSkill?.skill === item.skill;
              return (
                <tr
                  key={item.skill}
                  onClick={() => onSelectSkill(item)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[#F4E2D3]/40"
                      : "hover:bg-[#FAF7F2]"
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-[#241914]">
                    <div className="flex items-center gap-2">
                      {item.hasBeforeAfterHistory && (
                        <span className="size-2 rounded-full bg-[#2E8B57]" title="Re-verified via task submission" />
                      )}
                      <span>{item.skill}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2 max-w-[140px]">
                      <div className="flex-1 h-2 rounded-full bg-[#FAF7F2] border border-[#E7DCD1] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.status === "PROVEN"
                              ? "bg-[#2E8B57]"
                              : item.status === "PARTIAL"
                              ? "bg-[#D99125]"
                              : "bg-[#E7DCD1]"
                          }`}
                          style={{ width: `${item.evidenceScore}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-bold text-[#241914] w-8 text-right">
                        {item.evidenceScore}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#756B64] font-medium">
                    {item.evidenceCount} {item.evidenceCount === 1 ? "signal" : "signals"}
                  </td>
                  <td className="py-3.5 px-4 text-[#756B64] font-medium">
                    {item.repositoryCount} {item.repositoryCount === 1 ? "repo" : "repos"}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[11px] font-bold text-[#A95F3D] hover:underline inline-flex items-center gap-1">
                      <FileCode2 className="size-3" />
                      Details
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
