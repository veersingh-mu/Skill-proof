import type { JobMatchEvaluation, JobMatchResult } from "@/lib/jobs/types";
import { determineGapPriority, PRIORITY_ORDER } from "./prioritizer";
import type { GapType, SkillGap, SkillGapAnalysis, SkillGapSummary } from "./types";

/**
 * Deterministically detects and classifies skill gaps from a Phase 7 JobMatchEvaluation.
 */
export function detectSkillGaps(matchEvaluation: JobMatchEvaluation): SkillGapAnalysis {
  const allGaps: SkillGap[] = matchEvaluation.matches.map((m: JobMatchResult) => {
    let gapType: GapType = "EVIDENCE_GAP";
    let explanation = `No sufficient GitHub evidence currently verifies ${m.skill}.`;

    if (m.matchStatus === "VERIFIED_MATCH" || m.candidateStatus === "PROVEN") {
      gapType = "NONE";
      explanation =
        m.explanation ||
        `${m.skill} is fully verified with direct repository and development evidence.`;
    } else if (m.matchStatus === "PARTIAL_MATCH" || m.candidateStatus === "PARTIAL") {
      gapType = "PARTIAL";
      explanation =
        `Some GitHub evidence supports ${m.skill}, but the available evidence does not meet the project's threshold for PROVEN.`;
    } else {
      gapType = "EVIDENCE_GAP";
      explanation = `No sufficient GitHub evidence currently verifies ${m.skill}.`;
    }

    const priority = determineGapPriority(m.requirementType, gapType);
    const supportingEvidence = gapType === "EVIDENCE_GAP" ? [] : m.supportingEvidence;
    const repositoryCount = gapType === "EVIDENCE_GAP" ? 0 : m.repositoryCount;

    return {
      skill: m.skill,
      requirementType: m.requirementType,
      gapType,
      candidateStatus: m.candidateStatus,
      verificationScore: m.verificationScore,
      priority,
      evidenceCount: supportingEvidence.length,
      explanation,
      supportingEvidence,
      repositoryCount,
      sourceText: m.sourceText,
    };
  });

  // Calculate summary metrics
  let totalRequired = 0;
  let totalPreferred = 0;
  let verifiedCount = 0;
  let partialCount = 0;
  let evidenceGapCount = 0;
  let requiredEvidenceGaps = 0;
  let preferredEvidenceGaps = 0;
  let requiredPartialGaps = 0;
  let preferredPartialGaps = 0;
  let highPriorityCount = 0;
  let mediumPriorityCount = 0;
  let lowPriorityCount = 0;

  for (const gap of allGaps) {
    if (gap.requirementType === "REQUIRED") {
      totalRequired++;
    } else {
      totalPreferred++;
    }

    if (gap.gapType === "NONE") {
      verifiedCount++;
    } else if (gap.gapType === "PARTIAL") {
      partialCount++;
      if (gap.requirementType === "REQUIRED") {
        requiredPartialGaps++;
      } else {
        preferredPartialGaps++;
      }
    } else {
      evidenceGapCount++;
      if (gap.requirementType === "REQUIRED") {
        requiredEvidenceGaps++;
      } else {
        preferredEvidenceGaps++;
      }
    }

    if (gap.gapType !== "NONE") {
      if (gap.priority === "HIGH") highPriorityCount++;
      else if (gap.priority === "MEDIUM") mediumPriorityCount++;
      else lowPriorityCount++;
    }
  }

  const summary: SkillGapSummary = {
    totalRequired,
    totalPreferred,
    totalRequirements: allGaps.length,
    verifiedCount,
    partialCount,
    evidenceGapCount,
    requiredEvidenceGaps,
    preferredEvidenceGaps,
    requiredPartialGaps,
    preferredPartialGaps,
    highPriorityCount,
    mediumPriorityCount,
    lowPriorityCount,
  };

  // Sort gaps by priority: HIGH -> MEDIUM -> LOW, then alphabetically by skill name
  const gaps = allGaps
    .filter((g) => g.gapType !== "NONE")
    .sort((a, b) => {
      const pDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (pDiff !== 0) return pDiff;
      return a.skill.localeCompare(b.skill);
    });

  const verifiedRequirements = allGaps
    .filter((g) => g.gapType === "NONE")
    .sort((a, b) => a.skill.localeCompare(b.skill));

  return {
    summary,
    gaps,
    verifiedRequirements,
    all: allGaps,
    evaluatedAt: new Date().toISOString(),
  };
}
