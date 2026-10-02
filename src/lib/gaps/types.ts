import type { GitHubEvidenceItem } from "@/types";
import type { CandidateMatchVerificationStatus, RequirementType } from "@/lib/jobs/types";

export type GapType = "NONE" | "PARTIAL" | "EVIDENCE_GAP";

export type GapPriority = "HIGH" | "MEDIUM" | "LOW";

export interface SkillGap {
  /** Canonical skill name */
  skill: string;
  /** Whether the skill is REQUIRED or PREFERRED in the JD */
  requirementType: RequirementType;
  /** Classification: NONE (verified), PARTIAL (partial evidence), EVIDENCE_GAP (unverified) */
  gapType: GapType;
  /** Candidate verification status from Phase 4 ("PROVEN" | "PARTIAL" | "CLAIMED_ONLY" | "NOT_FOUND") */
  candidateStatus: CandidateMatchVerificationStatus;
  /** Deterministic score from Phase 4 (0 to 100) */
  verificationScore: number;
  /** Deterministic priority: HIGH, MEDIUM, LOW */
  priority: GapPriority;
  /** Number of supporting factual evidence items */
  evidenceCount: number;
  /** Factual explanation describing why this gap status and priority was assigned */
  explanation: string;
  /** Factual supporting evidence items from Phase 3 GitHub mining */
  supportingEvidence: GitHubEvidenceItem[];
  /** Count of distinct public repositories where evidence was found */
  repositoryCount: number;
  /** Original requirement source context from JD */
  sourceText?: string;
}

export interface SkillGapSummary {
  /** Total required skills in the job */
  totalRequired: number;
  /** Total preferred skills in the job */
  totalPreferred: number;
  /** Total technical requirements */
  totalRequirements: number;
  /** Number of fully verified requirements (NO GAP) */
  verifiedCount: number;
  /** Number of requirements with partial evidence (PARTIAL GAP) */
  partialCount: number;
  /** Number of requirements with insufficient evidence (EVIDENCE GAP) */
  evidenceGapCount: number;
  /** Required skills with zero sufficient evidence (HIGH priority) */
  requiredEvidenceGaps: number;
  /** Preferred skills with zero sufficient evidence (LOW priority) */
  preferredEvidenceGaps: number;
  /** Required skills with partial evidence (MEDIUM priority) */
  requiredPartialGaps: number;
  /** Preferred skills with partial evidence (LOW priority) */
  preferredPartialGaps: number;
  /** High priority gap count */
  highPriorityCount: number;
  /** Medium priority gap count */
  mediumPriorityCount: number;
  /** Low priority gap count */
  lowPriorityCount: number;
}

export interface SkillGapAnalysis {
  summary: SkillGapSummary;
  /** Requirements that have an evidence gap or partial gap (sorted by priority HIGH -> MEDIUM -> LOW) */
  gaps: SkillGap[];
  /** Requirements that are fully verified (NO GAP) */
  verifiedRequirements: SkillGap[];
  /** All technical requirements with their gap classifications */
  all: SkillGap[];
  /** Timestamp when gap analysis was performed */
  evaluatedAt: string;
}
