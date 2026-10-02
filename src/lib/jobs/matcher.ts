import { normalizeSkill } from "@/lib/resume/normalize";
import type { CandidateVerificationSession } from "@/lib/evidence/session";
import type { SkillVerificationResult } from "@/lib/evidence/types";
import { calculateCoverageMetrics } from "./scoring";
import type {
  CandidateMatchVerificationStatus,
  JobDescriptionAnalysis,
  JobMatchEvaluation,
  JobMatchResult,
  MatchStatus,
} from "./types";

/**
 * Matches extracted Job Description requirements against candidate verification session results.
 *
 * Rules:
 * - PROVEN -> VERIFIED_MATCH
 * - PARTIAL -> PARTIAL_MATCH
 * - CLAIMED_ONLY -> NOT_VERIFIED ("No sufficient GitHub evidence currently verifies this requirement.")
 * - Not found -> NOT_VERIFIED ("No sufficient GitHub evidence currently verifies this requirement.")
 */
export function matchJobRequirements(
  job: JobDescriptionAnalysis,
  session: CandidateVerificationSession
): JobMatchEvaluation {
  const verifications = session.evaluation?.verifications || [];
  const claims = session.claims || [];

  const matches: JobMatchResult[] = job.requirements.map((req) => {
    // Find matching verified skill in candidate session
    const matchedVerification: SkillVerificationResult | undefined = verifications.find((v) => {
      if (v.skill.toLowerCase() === req.normalizedSkill.toLowerCase()) return true;
      const normalizedV = normalizeSkill(v.skill)?.canonicalName;
      return normalizedV === req.normalizedSkill;
    });

    let candidateStatus: CandidateMatchVerificationStatus = "NOT_FOUND";
    let matchStatus: MatchStatus = "NOT_VERIFIED";
    let verificationScore = 0;
    let supportingEvidence = matchedVerification?.evidenceItems || [];
    let repositoryCount = matchedVerification?.repositoryCount || 0;
    let explanation = `No sufficient GitHub evidence currently verifies ${req.skill}.`;

    if (matchedVerification) {
      candidateStatus = matchedVerification.status;
      verificationScore = matchedVerification.evidenceScore;

      if (candidateStatus === "PROVEN") {
        matchStatus = "VERIFIED_MATCH";
        explanation =
          matchedVerification.reason ||
          `${req.skill} is supported by verified repository and development evidence.`;
      } else if (candidateStatus === "PARTIAL") {
        matchStatus = "PARTIAL_MATCH";
        explanation =
          matchedVerification.reason ||
          `${req.skill} has partial GitHub evidence but does not meet full PROVEN criteria.`;
      } else {
        // CLAIMED_ONLY
        matchStatus = "NOT_VERIFIED";
        supportingEvidence = [];
        repositoryCount = 0;
        explanation = `No sufficient GitHub evidence currently verifies ${req.skill}.`;
      }
    } else {
      // Check if candidate claimed the skill on resume even if not in verification output
      const claimed = claims.some((c) => {
        if (c.canonicalSkill.toLowerCase() === req.normalizedSkill.toLowerCase()) return true;
        const norm = normalizeSkill(c.canonicalSkill)?.canonicalName;
        return norm === req.normalizedSkill;
      });

      if (claimed) {
        candidateStatus = "CLAIMED_ONLY";
      } else {
        candidateStatus = "NOT_FOUND";
      }
      matchStatus = "NOT_VERIFIED";
      supportingEvidence = [];
      repositoryCount = 0;
      explanation = `No sufficient GitHub evidence currently verifies ${req.skill}.`;
    }

    return {
      skill: req.skill,
      requirementType: req.requirementType,
      candidateStatus,
      matchStatus,
      verificationScore,
      supportingEvidence,
      repositoryCount,
      explanation,
      sourceText: req.sourceText,
    };
  });

  const metrics = calculateCoverageMetrics(matches);
  const isSample = session.githubResult?.analysisRunId?.startsWith("run_sample_") ?? false;

  return {
    job,
    matches,
    metrics,
    candidate: {
      name: session.candidate?.name || "Candidate",
      githubUsername: session.githubUsername,
      isSample,
    },
    evaluatedAt: new Date().toISOString(),
  };
}
