import type { GitHubAnalysisResult, ResumeClaim } from "@/types";
import type { EvidenceEngineResult } from "./types";

export const VERIFICATION_SESSION_STORAGE_KEY = "skillproof_active_verification_session";

export interface CandidateVerificationSession {
  candidate: {
    name?: string;
    email?: string;
  };
  githubUsername: string;
  analyzedAt: string;
  metadata?: {
    filename: string;
    pageCount: number;
  };
  claims: ResumeClaim[];
  githubResult: GitHubAnalysisResult;
  evaluation: EvidenceEngineResult;
}

/**
 * Saves the active verification session to browser localStorage.
 */
export function saveVerificationSession(session: CandidateVerificationSession): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(VERIFICATION_SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn("Unable to persist verification session to localStorage:", err);
  }
}

/**
 * Loads the active verification session from browser localStorage.
 */
export function loadVerificationSession(): CandidateVerificationSession | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(VERIFICATION_SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CandidateVerificationSession;
  } catch (err) {
    console.warn("Unable to parse verification session from localStorage:", err);
    return null;
  }
}

/**
 * Clears the active verification session from browser localStorage.
 */
export function clearVerificationSession(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.removeItem(VERIFICATION_SESSION_STORAGE_KEY);
  } catch (err) {
    console.warn("Unable to clear verification session from localStorage:", err);
  }
}

/**
 * Deterministically applies an analyzed task submission and its newly discovered evidence
 * to an existing candidate verification session, keeping the Dashboard and Evidence Graph in sync.
 */
export function applySubmissionToSession(
  session: CandidateVerificationSession,
  targetSkill: string,
  updatedVerification: import("./types").SkillVerificationResult,
  allEvidence: import("@/types").GitHubEvidenceItem[],
  allRepositories: import("@/types").GitHubRepository[]
): CandidateVerificationSession {
  const updatedVerifications = session.evaluation.verifications.map((v) => {
    if (v.skill.toLowerCase() === targetSkill.toLowerCase()) {
      return updatedVerification;
    }
    return v;
  });

  if (!updatedVerifications.some((v) => v.skill.toLowerCase() === targetSkill.toLowerCase())) {
    updatedVerifications.push(updatedVerification);
  }

  let provenCount = 0;
  let partialCount = 0;
  let claimedOnlyCount = 0;
  let totalScore = 0;

  for (const v of updatedVerifications) {
    if (v.status === "PROVEN") provenCount++;
    else if (v.status === "PARTIAL") partialCount++;
    else claimedOnlyCount++;
    totalScore += v.evidenceScore;
  }

  const averageScore =
    updatedVerifications.length > 0 ? Math.round(totalScore / updatedVerifications.length) : 0;

  return {
    ...session,
    analyzedAt: new Date().toISOString(),
    githubResult: {
      ...session.githubResult,
      evidence: allEvidence,
      repositories: allRepositories,
    },
    evaluation: {
      ...session.evaluation,
      evaluatedAt: new Date().toISOString(),
      summary: {
        totalClaims: updatedVerifications.length,
        provenCount,
        partialCount,
        claimedOnlyCount,
        averageScore,
      },
      verifications: updatedVerifications,
    },
  };
}
