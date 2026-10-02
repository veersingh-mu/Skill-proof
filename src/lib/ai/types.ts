import type { GapPriority, GapType } from "@/lib/gaps/types";
import type { CandidateMatchVerificationStatus, RequirementType } from "@/lib/jobs/types";

export type MicroTaskDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface MicroTask {
  id: string;
  skill: string;
  title: string;
  objective: string;
  scenario: string;
  requirements: string[];
  steps: string[];
  deliverables: string[];
  acceptanceCriteria: string[];
  suggestedTechnologies: string[];
  estimatedTime: string;
  difficulty: MicroTaskDifficulty;
  evidenceProduced: string[];
  verificationHints: string[];
  generatedAt: string;
}

export interface TaskGapContext {
  skill: string;
  requirementType: RequirementType;
  gapType: GapType;
  candidateStatus: CandidateMatchVerificationStatus;
  verificationScore: number;
  priority: GapPriority;
  explanation: string;
  sourceText?: string;
}

export interface MicroTaskResult {
  task: MicroTask;
  gapContext: TaskGapContext;
}