import type { JobMatchResult, RequirementCoverageMetrics } from "./types";

/**
 * Calculates deterministic, evidence-based requirement coverage percentages.
 *
 * Scoring Weights:
 * - PROVEN = 100% (weight 1.0)
 * - PARTIAL = 50% (weight 0.5)
 * - NOT_VERIFIED = 0% (weight 0.0)
 */
export function calculateCoverageMetrics(matches: JobMatchResult[]): RequirementCoverageMetrics {
  const requiredMatches = matches.filter((m) => m.requirementType === "REQUIRED");
  const preferredMatches = matches.filter((m) => m.requirementType === "PREFERRED");

  const countFor = (subset: JobMatchResult[]) => {
    let verified = 0;
    let partial = 0;
    let notVerified = 0;

    for (const m of subset) {
      if (m.matchStatus === "VERIFIED_MATCH") {
        verified++;
      } else if (m.matchStatus === "PARTIAL_MATCH") {
        partial++;
      } else {
        notVerified++;
      }
    }

    return { total: subset.length, verified, partial, notVerified };
  };

  const reqCounts = countFor(requiredMatches);
  const prefCounts = countFor(preferredMatches);

  const calcPercentage = (counts: { total: number; verified: number; partial: number }) => {
    if (counts.total === 0) return 0;
    const score = counts.verified * 1.0 + counts.partial * 0.5;
    return Math.round((score / counts.total) * 1000) / 10;
  };

  const totalReqs = matches.length;
  const overallScore =
    reqCounts.verified * 1.0 +
    reqCounts.partial * 0.5 +
    prefCounts.verified * 1.0 +
    prefCounts.partial * 0.5;

  const overallCoverage =
    totalReqs === 0 ? 0 : Math.round((overallScore / totalReqs) * 1000) / 10;

  return {
    requiredCoverage: calcPercentage(reqCounts),
    preferredCoverage: calcPercentage(prefCounts),
    overallCoverage,
    requiredCounts: reqCounts,
    preferredCounts: prefCounts,
    totalRequirements: totalReqs,
  };
}
