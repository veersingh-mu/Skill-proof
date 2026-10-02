import type { GitHubEvidenceItem, SkillStatus } from "@/types";

export type RequirementType = "REQUIRED" | "PREFERRED";

export interface JobRequirement {
  /** Canonical name of the skill from taxonomy, e.g. "React", "TypeScript" */
  skill: string;
  /** Normalized canonical skill name */
  normalizedSkill: string;
  /** Whether the requirement is required or preferred / nice-to-have */
  requirementType: RequirementType;
  /** Category from taxonomy (e.g. Frontend, Backend, DevOps, Database) */
  category?: string;
  /** The source snippet or line from which this skill was extracted */
  sourceText?: string;
  /** Extracted alias or verbatim token matched in text */
  matchedTerm?: string;
}

export interface JobDescriptionAnalysis {
  title?: string;
  rawDescription: string;
  requirements: JobRequirement[];
  extractedSkills: string[];
  requiredSkills: string[];
  preferredSkills: string[];
}

export type CandidateMatchVerificationStatus = SkillStatus | "NOT_FOUND";

export type MatchStatus = "VERIFIED_MATCH" | "PARTIAL_MATCH" | "NOT_VERIFIED";

export interface JobMatchResult {
  /** Canonical skill name */
  skill: string;
  /** Required vs Preferred */
  requirementType: RequirementType;
  /** Status of this skill in candidate's verification session ("PROVEN" | "PARTIAL" | "CLAIMED_ONLY" | "NOT_FOUND") */
  candidateStatus: CandidateMatchVerificationStatus;
  /** Factual match status ("VERIFIED_MATCH" | "PARTIAL_MATCH" | "NOT_VERIFIED") */
  matchStatus: MatchStatus;
  /** Deterministic score from Phase 4 verification (0 to 100) */
  verificationScore: number;
  /** Factual supporting evidence items from Phase 3 GitHub mining */
  supportingEvidence: GitHubEvidenceItem[];
  /** Count of distinct public repositories where evidence was found */
  repositoryCount: number;
  /** Human-readable factual explanation of why this match status was assigned */
  explanation: string;
  /** Original requirement source context from JD */
  sourceText?: string;
}

export interface RequirementCoverageMetrics {
  /** Required skills coverage percentage (0.0 to 100.0) */
  requiredCoverage: number;
  /** Preferred skills coverage percentage (0.0 to 100.0) */
  preferredCoverage: number;
  /** Overall evidence coverage percentage (0.0 to 100.0) */
  overallCoverage: number;
  /** Required category skill counts */
  requiredCounts: {
    total: number;
    verified: number;
    partial: number;
    notVerified: number;
  };
  /** Preferred category skill counts */
  preferredCounts: {
    total: number;
    verified: number;
    partial: number;
    notVerified: number;
  };
  /** Total number of extracted technical requirements */
  totalRequirements: number;
}

export interface JobMatchEvaluation {
  job: JobDescriptionAnalysis;
  matches: JobMatchResult[];
  metrics: RequirementCoverageMetrics;
  candidate: {
    name?: string;
    githubUsername?: string;
    isSample: boolean;
  };
  evaluatedAt: string;
}
