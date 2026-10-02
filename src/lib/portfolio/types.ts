import type { GitHubEvidenceItem, GitHubRepository, SkillStatus } from "@/types";
import type { SkillGap } from "@/lib/gaps/types";
import type { JobMatchEvaluation } from "@/lib/jobs/types";
import type { CriteriaAssessmentItem } from "@/lib/tasks/types";

export interface VerificationTimelineEntry {
  id: string;
  skill: string;
  timestamp: string;
  previousStatus: SkillStatus;
  newStatus: SkillStatus;
  previousScore: number;
  newScore: number;
  scoreDelta: number;
  reasons: string[];
  newEvidence: GitHubEvidenceItem[];
  repositoryUrl: string;
}

export interface TaskPortfolioItem {
  id: string;
  taskId: string;
  title?: string;
  skill: string;
  repositoryUrl: string;
  submittedAt: string;
  status: string;
  scoreDelta: number;
  previousStatus: SkillStatus;
  newStatus: SkillStatus;
  criteriaAssessment: CriteriaAssessmentItem[];
}

export interface SkillPortfolioItem {
  skill: string;
  status: SkillStatus;
  evidenceScore: number;
  reason: string;
  evidenceCount: number;
  repositoryCount: number;
  distinctSignalTypes: string[];
  evidenceItems: GitHubEvidenceItem[];
  hasBeforeAfterHistory: boolean;
  timeline: VerificationTimelineEntry[];
}

export interface PortfolioSummary {
  claimedSkillsCount: number;
  provenCount: number;
  partialCount: number;
  insufficientCount: number;
  repositoryCount: number;
  evidenceCount: number;
  averageScore: number;
}

export interface SkillProofPortfolio {
  candidate: {
    name: string;
    githubUsername?: string;
    email?: string;
  };
  summary: PortfolioSummary;
  skills: SkillPortfolioItem[];
  repositories: GitHubRepository[];
  verificationHistory: VerificationTimelineEntry[];
  tasks: TaskPortfolioItem[];
  skillGaps: SkillGap[];
  jobMatch?: JobMatchEvaluation | null;
  generatedAt: string;
}
