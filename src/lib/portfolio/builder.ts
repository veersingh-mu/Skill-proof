import type { CandidateVerificationSession } from "@/lib/evidence/session";
import type { TaskSubmission } from "@/lib/tasks/types";
import type { JobMatchEvaluation } from "@/lib/jobs/types";
import { detectSkillGaps } from "@/lib/gaps/detector";
import type {
  SkillProofPortfolio,
  SkillPortfolioItem,
  VerificationTimelineEntry,
  TaskPortfolioItem,
  PortfolioSummary,
} from "./types";

/**
 * Deterministically constructs a comprehensive SkillProof Portfolio from
 * active verification session data, Phase 10 task submissions, and Phase 7/8 job gaps.
 *
 * GUARANTEES:
 * - Deterministic: same inputs always produce identical output.
 * - Strict adherence to Phase 4 scores, statuses, and explanations.
 * - No AI involvement in scoring, point calculation, or status verification.
 * - Zero fabricated candidate, company, school, or history data.
 */
export function buildSkillProofPortfolio(
  session: CandidateVerificationSession | null,
  taskSubmissions: TaskSubmission[] = [],
  jobMatch: JobMatchEvaluation | null = null
): SkillProofPortfolio {
  const now = new Date().toISOString();

  // 1. Candidate Info
  const candidateName = session?.candidate?.name?.trim() || "SkillProof Candidate";
  const githubUsername = session?.githubUsername || session?.githubResult?.profile?.username || undefined;
  const candidateEmail = session?.candidate?.email?.trim() || undefined;

  // 2. Map submissions by skill
  const submissionsBySkill = new Map<string, TaskSubmission[]>();
  for (const sub of taskSubmissions) {
    const key = sub.skill.toLowerCase();
    const list = submissionsBySkill.get(key) || [];
    list.push(sub);
    submissionsBySkill.set(key, list);
  }

  // 3. Map Skills & Timeline
  const verifications = session?.evaluation?.verifications || [];
  const skills: SkillPortfolioItem[] = verifications.map((v) => {
    const matchingSubs = submissionsBySkill.get(v.skill.toLowerCase()) || [];

    const timeline: VerificationTimelineEntry[] = matchingSubs.map((s) => ({
      id: s.id,
      skill: s.skill,
      timestamp: s.submittedAt || s.createdAt,
      previousStatus: s.beforeVerification.status,
      newStatus: s.afterVerification.status,
      previousScore: s.beforeVerification.evidenceScore,
      newScore: s.afterVerification.evidenceScore,
      scoreDelta: s.evidenceDiff.scoreDelta,
      reasons: s.evidenceDiff.reasons,
      newEvidence: s.evidenceDiff.added || [],
      repositoryUrl: s.repositoryUrl,
    }));

    return {
      skill: v.skill,
      status: v.status,
      evidenceScore: v.evidenceScore,
      reason: v.reason,
      evidenceCount: v.evidenceItems?.length ?? 0,
      repositoryCount: v.repositoryCount ?? 0,
      distinctSignalTypes: v.distinctSignalTypes ?? [],
      evidenceItems: v.evidenceItems ?? [],
      hasBeforeAfterHistory: timeline.length > 0,
      timeline,
    };
  });

  // 4. Compute Summary
  const provenCount = skills.filter((s) => s.status === "PROVEN").length;
  const partialCount = skills.filter((s) => s.status === "PARTIAL").length;
  const insufficientCount = skills.filter((s) => s.status === "CLAIMED_ONLY").length;
  const repositoryCount = session?.githubResult?.repositories?.length ?? 0;
  const evidenceCount = session?.githubResult?.evidence?.length ?? 0;
  const averageScore =
    skills.length > 0
      ? Math.round(skills.reduce((acc, s) => acc + s.evidenceScore, 0) / skills.length)
      : 0;

  const summary: PortfolioSummary = {
    claimedSkillsCount: skills.length,
    provenCount,
    partialCount,
    insufficientCount,
    repositoryCount,
    evidenceCount,
    averageScore,
  };

  // 5. Global Verification History (all timeline entries across skills)
  const verificationHistory: VerificationTimelineEntry[] = [];
  for (const s of skills) {
    verificationHistory.push(...s.timeline);
  }
  verificationHistory.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // 6. Tasks
  const tasks: TaskPortfolioItem[] = taskSubmissions.map((s) => ({
    id: s.id,
    taskId: s.taskId,
    title: `Practical Task: ${s.skill}`,
    skill: s.skill,
    repositoryUrl: s.repositoryUrl,
    submittedAt: s.submittedAt || s.createdAt,
    status: s.status,
    scoreDelta: s.evidenceDiff?.scoreDelta ?? 0,
    previousStatus: s.beforeVerification?.status ?? "CLAIMED_ONLY",
    newStatus: s.afterVerification?.status ?? "CLAIMED_ONLY",
    criteriaAssessment: s.criteriaAssessment ?? [],
  }));

  // 7. Skill Gaps from Job Match if available
  let skillGaps: SkillProofPortfolio["skillGaps"] = [];
  if (jobMatch && jobMatch.matches && jobMatch.matches.length > 0) {
    try {
      const gapAnalysis = detectSkillGaps(jobMatch);
      skillGaps = gapAnalysis.gaps;
    } catch {
      skillGaps = [];
    }
  }

  return {
    candidate: {
      name: candidateName,
      githubUsername,
      email: candidateEmail,
    },
    summary,
    skills,
    repositories: session?.githubResult?.repositories || [],
    verificationHistory,
    tasks,
    skillGaps,
    jobMatch: jobMatch || null,
    generatedAt: now,
  };
}
