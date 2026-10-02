"use client";

import { CheckCircle, Star, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { JobDescriptionAnalysis } from "@/lib/jobs/types";

interface JobRequirementsProps {
  analysis: JobDescriptionAnalysis;
}

export function JobRequirements({ analysis }: JobRequirementsProps) {
  const { title, requiredSkills, preferredSkills, extractedSkills } = analysis;

  if (extractedSkills.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#E7DCD1] bg-white p-6 text-center text-xs text-[#756B64]">
        No recognized technical skill requirements were detected in this job description. Try adding explicit skills like React, Node.js, Docker, or Python.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E7DCD1] bg-white p-6 sm:p-7 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7DCD1] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-[#A95F3D]" />
            <h3 className="text-sm font-bold text-[#241914]">
              Extracted Technical Requirements
            </h3>
            {title && (
              <span className="text-xs text-[#756B64] font-medium">
                ({title})
              </span>
            )}
          </div>
          <p className="text-xs text-[#756B64] mt-0.5">
            Normalized using SkillProof taxonomy and classified into required vs. preferred categories.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="outline" className="text-xs font-mono font-bold bg-[#FAF7F2] border-[#E7DCD1] text-[#241914] rounded-lg">
            {extractedSkills.length} Total Skill{extractedSkills.length === 1 ? "" : "s"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Required Skills Section */}
        <div className="space-y-3 rounded-xl border border-[#A95F3D]/25 bg-[#F4E2D3]/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-[#A95F3D] shrink-0" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A95F3D]">
                Required Skills
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-[#A95F3D]">
              {requiredSkills.length} requirement{requiredSkills.length === 1 ? "" : "s"}
            </span>
          </div>

          {requiredSkills.length === 0 ? (
            <p className="text-xs text-[#756B64] italic">None explicitly classified as required.</p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border border-[#A95F3D]/30 bg-white text-[#A95F3D] shadow-2xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Preferred Skills Section */}
        <div className="space-y-3 rounded-xl border border-[#E7DCD1] bg-[#FAF7F2] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="size-4 text-[#6D351F] shrink-0" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6D351F]">
                Preferred / Nice-to-Have
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-[#756B64]">
              {preferredSkills.length} requirement{preferredSkills.length === 1 ? "" : "s"}
            </span>
          </div>

          {preferredSkills.length === 0 ? (
            <p className="text-xs text-[#756B64] italic">None explicitly classified as preferred.</p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {preferredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border border-[#E7DCD1] bg-white text-[#241914] shadow-2xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
