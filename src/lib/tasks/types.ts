import type { GitHubEvidenceItem, SkillStatus } from "@/types";
import type { SkillVerificationResult } from "@/lib/evidence/types";
import type { MicroTask, TaskGapContext } from "@/lib/ai/types";

export type TaskSubmissionStatus =
  | "NOT_SUBMITTED"
  | "SUBMITTED"
  | "ANALYZING"
  | "ANALYZED"
  | "VERIFICATION_UPDATED"
  | "ANALYSIS_FAILED";

export interface EvidenceDiff {
  added: GitHubEvidenceItem[];
  unchanged: GitHubEvidenceItem[];
  removed: GitHubEvidenceItem[];
  previousScore: number;
  newScore: number;
  scoreDelta: number;
  previousStatus: SkillStatus;
  newStatus: SkillStatus;
  reasons: string[];
}

export interface CriteriaAssessmentItem {
  criterion: string;
  detected: boolean;
  matchingFact?: string;
  sourceType?: string;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  skill: string;
  repositoryUrl: string;
  githubOwner: string;
  githubRepo: string;
  submittedAt: string;
  status: TaskSubmissionStatus;
  beforeVerification: SkillVerificationResult;
  afterVerification: SkillVerificationResult;
  evidenceDiff: EvidenceDiff;
  criteriaAssessment: CriteriaAssessmentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskSubmissionRequest {
  taskId: string;
  skill: string;
  repositoryUrl: string;
  task?: MicroTask;
  gapContext?: TaskGapContext;
}

export interface TaskSubmissionResult {
  submission: TaskSubmission;
  message: string;
}
