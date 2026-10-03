/**
 * Behance Project Analyzer.
 *
 * Orchestrates the full analysis pipeline:
 * 1. Fetch profile & projects via BehanceProvider
 * 2. Detect creative evidence from each project
 * 3. Normalize evidence into the common GitHubEvidenceItem model
 * 4. Apply diminishing returns across projects
 * 5. Return BehanceAnalysisResult for Evidence Engine consumption
 *
 * This module does NOT determine verification status.
 * All evidence is passed to the existing deterministic Evidence Engine.
 */

import "server-only";
import type { BehanceAnalysisResult, BehanceProject } from "@/types/behance";
import type { GitHubEvidenceItem } from "@/types";
import { BEHANCE_CONFIG } from "./config";
import { createBehanceProvider, type IBehanceProvider } from "./client";
import {
  detectCreativeEvidence,
  detectionsToEvidence,
} from "./detectors/creative-detectors";

export interface AnalyzeBehanceOptions {
  username: string;
  candidateId?: string;
  provider?: IBehanceProvider;
}

/**
 * Analyzes a Behance profile: discovers projects, extracts creative evidence,
 * and returns results in the unified evidence format.
 */
export async function analyzeBehanceUser(
  options: AnalyzeBehanceOptions
): Promise<BehanceAnalysisResult> {
  const { username, candidateId, provider: injectedProvider } = options;
  const provider = injectedProvider ?? createBehanceProvider();
  const analysisRunId = crypto.randomUUID();

  // 1. Fetch profile
  const profile = await provider.getProfile(username);

  // 2. Fetch projects (limited)
  const projects = await provider.getProjects(
    username,
    BEHANCE_CONFIG.MAX_PROJECTS
  );

  // 3. Analyze each project for creative evidence
  const allEvidence: GitHubEvidenceItem[] = [];
  const skillHintsSet = new Set<string>();
  const analyzedProjects: BehanceProject[] = [];

  for (const project of projects) {
    const detections = detectCreativeEvidence(project);

    if (detections.length > 0) {
      const evidence = detectionsToEvidence(
        project,
        detections,
        profile.profileUrl,
        candidateId
      );

      // Add project-level evidence: the project itself is evidence of creative work
      allEvidence.push({
        id: crypto.randomUUID(),
        candidateId,
        repositoryId: project.id,
        repositoryName: project.title,
        type: "behance_project" as GitHubEvidenceItem["type"],
        skillHints: detections.flatMap((d) => d.skillHints).filter(
          (v, i, a) => a.indexOf(v) === i
        ),
        sourceUrl: project.url,
        extractedFact: `Behance project "${project.title}" with ${project.mediaCount} media items. Categories: ${project.categories.join(", ") || "None"}.`,
        collectedAt: new Date().toISOString(),
        analyzerVersion: BEHANCE_CONFIG.ANALYZER_VERSION,
        provider: "behance",
        metadata: {
          projectId: project.id,
          profileUrl: profile.profileUrl,
          projectTitle: project.title,
          mediaCount: project.mediaCount,
          categories: project.categories,
        },
      });

      for (const item of evidence) {
        allEvidence.push(item);
      }

      for (const d of detections) {
        for (const hint of d.skillHints) {
          skillHintsSet.add(hint);
        }
      }
    }

    analyzedProjects.push(project);
  }

  return {
    analysisRunId,
    profile,
    projects: analyzedProjects,
    evidence: allEvidence,
    summary: {
      projectsDiscovered: projects.length,
      projectsAnalyzed: analyzedProjects.length,
      evidenceItems: allEvidence.length,
      skillHintsDetected: Array.from(skillHintsSet),
    },
  };
}
