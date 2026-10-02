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
      <div className="rounded-xl border border-dashed border-border/80 bg-card/40 p-6 text-center text-xs text-muted-foreground">
        No recognized technical skill requirements were detected in this job description. Try adding explicit skills like React, Node.js, Docker, or Python.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card/60 p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-foreground">
              Extracted Technical Requirements
            </h3>
            {title && (
              <span className="text-xs text-muted-foreground font-normal">
                ({title})
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Normalized using SkillProof taxonomy and classified into required vs. preferred categories.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="outline" className="text-xs font-mono bg-background/50 border-border">
            {extractedSkills.length} Total Skill{extractedSkills.length === 1 ? "" : "s"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Required Skills Section */}
        <div className="space-y-3 rounded-lg border border-indigo-500/20 bg-indigo-500/[0.03] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-indigo-400 shrink-0" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Required Skills
              </h4>
            </div>
            <span className="text-xs font-mono font-medium text-indigo-300/80">
              {requiredSkills.length} requirement{requiredSkills.length === 1 ? "" : "s"}
            </span>
          </div>

          {requiredSkills.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">None explicitly classified as required.</p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border border-indigo-400/30 bg-indigo-500/10 text-indigo-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Preferred Skills Section */}
        <div className="space-y-3 rounded-lg border border-blue-500/20 bg-blue-500/[0.03] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="size-4 text-blue-400 shrink-0" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                Preferred / Nice-to-Have
              </h4>
            </div>
            <span className="text-xs font-mono font-medium text-blue-300/80">
              {preferredSkills.length} requirement{preferredSkills.length === 1 ? "" : "s"}
            </span>
          </div>

          {preferredSkills.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">None explicitly classified as preferred.</p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {preferredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border border-blue-400/30 bg-blue-500/10 text-blue-200"
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
