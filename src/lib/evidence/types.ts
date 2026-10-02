import type { GitHubEvidenceItem, SkillStatus } from "@/types";

/**
 * Result of evaluating a single resume skill claim against factual GitHub evidence.
 */
export interface SkillVerificationResult {
  /** The skill evaluated (canonical name or claim name) */
  skill: string;
  /** Deterministic status assigned by the Evidence Engine */
  status: SkillStatus; // "PROVEN" | "PARTIAL" | "CLAIMED_ONLY"
  /** Deterministic confidence score from 0 to 100 */
  evidenceScore: number;
  /** Explainable rationale describing the factual evidence supporting the status */
  reason: string;
  /** Direct factual evidence items associated with this skill */
  evidenceItems: GitHubEvidenceItem[];
  /** Distinct public repositories where evidence for this skill was detected */
  repositoryCount?: number;
  /** Distinct signal types matched (e.g. dependency, test, language) */
  distinctSignalTypes?: string[];
}

/**
 * High-level summary metrics of an Evidence Engine evaluation run.
 */
export interface EvidenceEngineSummary {
  totalClaims: number;
  provenCount: number;
  partialCount: number;
  claimedOnlyCount: number;
  averageScore: number;
}

/**
 * Complete evaluation result across all confirmed resume claims.
 */
export interface EvidenceEngineResult {
  evaluatedAt: string;
  summary: EvidenceEngineSummary;
  verifications: SkillVerificationResult[];
}
