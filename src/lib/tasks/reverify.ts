import { GitHubClient } from "@/lib/github/client";
import { analyzeRepositoryEvidence } from "@/lib/github/analyzer";
import { parseGitHubRepoUrl } from "@/lib/github/parse-url";
import { evaluateSkillClaim } from "@/lib/evidence/engine";
import type { GitHubEvidenceItem, GitHubRepository } from "@/types";
import type { SkillVerificationResult } from "@/lib/evidence/types";
import type { MicroTask } from "@/lib/ai/types";
import { computeEvidenceDiff, getEvidenceKey } from "./diff";
import type { CriteriaAssessmentItem, TaskSubmission, TaskSubmissionStatus } from "./types";

export interface ReverifyParams {
  taskId: string;
  skill: string;
  repositoryUrl: string;
  task?: MicroTask;
  existingEvidence?: GitHubEvidenceItem[];
  existingRepositories?: GitHubRepository[];
  previousVerification?: SkillVerificationResult;
  client?: GitHubClient;
}

/**
 * Maps task acceptance criteria to detected evidence items as informational feedback.
 * NOTE: This is purely explanatory feedback and NEVER overrides Phase 4 verification.
 */
function assessTaskCriteria(
  criteria: string[] = [],
  detectedEvidence: GitHubEvidenceItem[]
): CriteriaAssessmentItem[] {
  return criteria.map((criterion) => {
    const lower = criterion.toLowerCase();

    // Find any evidence item whose type, path, or extractedFact aligns with the criterion
    const match = detectedEvidence.find((ev) => {
      const type = ev.type.toLowerCase();
      const fact = ev.extractedFact.toLowerCase();
      const path = (ev.filePath || "").toLowerCase();

      if ((lower.includes("dockerfile") || lower.includes("container image")) && type === "dockerfile") {
        return true;
      }
      if ((lower.includes("compose") || lower.includes("docker-compose")) && type === "docker_compose") {
        return true;
      }
      if ((lower.includes("ci") || lower.includes("workflow") || lower.includes("github actions")) && type === "ci_cd") {
        return true;
      }
      if ((lower.includes("k8s") || lower.includes("kubernetes") || lower.includes("manifest")) && type === "kubernetes_manifest") {
        return true;
      }
      if ((lower.includes("test") || lower.includes("unit test") || lower.includes("pytest")) && (type === "test_file" || type === "test_framework")) {
        return true;
      }
      if ((lower.includes("readme") || lower.includes("documentation")) && type === "readme") {
        return true;
      }
      if (lower.includes("dependency") || lower.includes("requirements") || lower.includes("package")) {
        if (type === "dependency") return true;
      }

      // Keyword match in extractedFact
      const words = lower.split(/\s+/).filter((w) => w.length > 3);
      return words.some((word) => fact.includes(word) || path.includes(word));
    });

    return {
      criterion,
      detected: Boolean(match),
      matchingFact: match ? match.extractedFact : undefined,
      sourceType: match ? match.type : undefined,
    };
  });
}

/**
 * Re-verifies a micro-task submission by fetching real GitHub data, extracting factual evidence,
 * merging with existing evidence, and running the authoritative Phase 4 verification engine.
 */
export async function reverifyTaskSubmission(params: ReverifyParams): Promise<{
  submission: TaskSubmission;
  newDiscoveredEvidence: GitHubEvidenceItem[];
  allEvidence: GitHubEvidenceItem[];
  allRepositories: GitHubRepository[];
}> {
  const {
    taskId,
    skill,
    repositoryUrl,
    task,
    existingEvidence = [],
    existingRepositories = [],
    previousVerification: providedPrevVerif,
    client = new GitHubClient(),
  } = params;

  // 1. Validate & Parse GitHub URL
  const { owner, repo: repoName, normalizedUrl } = parseGitHubRepoUrl(repositoryUrl);

  // 2. Fetch Real Repository Metadata
  const repoMeta = await client.getRepository(owner, repoName);

  // 3. Extract Real Technical Evidence via Phase 3 Analyzer
  const { evidence: newEvidence } = await analyzeRepositoryEvidence(repoMeta, client);

  // 4. Compute Baseline (Previous) Verification for the Target Skill
  const previousVerification: SkillVerificationResult =
    providedPrevVerif || evaluateSkillClaim(skill, existingEvidence, existingRepositories);

  // 5. Merge Repositories (avoiding duplicates)
  const repoMap = new Map<string, GitHubRepository>();
  for (const r of existingRepositories) {
    repoMap.set(r.fullName.toLowerCase(), r);
  }
  repoMap.set(repoMeta.fullName.toLowerCase(), repoMeta);
  const allRepositories = Array.from(repoMap.values());

  // 6. Merge Evidence using stable key identity
  const evidenceMap = new Map<string, GitHubEvidenceItem>();
  for (const item of existingEvidence) {
    evidenceMap.set(getEvidenceKey(item), item);
  }
  for (const item of newEvidence) {
    evidenceMap.set(getEvidenceKey(item), item);
  }
  const allEvidence = Array.from(evidenceMap.values());

  // 7. Run Phase 4 Deterministic Engine on Target Skill with Combined Evidence
  const newVerification = evaluateSkillClaim(skill, allEvidence, allRepositories);

  // 8. Compute Evidence Diff for the target skill
  const previousTargetEvidence = previousVerification.evidenceItems || [];
  const newTargetEvidence = newVerification.evidenceItems || [];
  const evidenceDiff = computeEvidenceDiff(
    previousTargetEvidence,
    newTargetEvidence,
    previousVerification,
    newVerification
  );

  // 9. Informational Criteria Assessment
  const criteriaAssessment = assessTaskCriteria(task?.acceptanceCriteria || [], newEvidence);

  // 10. Construct Submission Result
  const now = new Date().toISOString();
  let status: TaskSubmissionStatus = "ANALYZED";
  if (previousVerification.status !== newVerification.status || evidenceDiff.scoreDelta > 0) {
    status = "VERIFICATION_UPDATED";
  }

  const submission: TaskSubmission = {
    id: crypto.randomUUID(),
    taskId,
    skill,
    repositoryUrl: normalizedUrl,
    githubOwner: owner,
    githubRepo: repoName,
    submittedAt: now,
    status,
    beforeVerification: previousVerification,
    afterVerification: newVerification,
    evidenceDiff,
    criteriaAssessment,
    createdAt: now,
    updatedAt: now,
  };

  return {
    submission,
    newDiscoveredEvidence: newEvidence,
    allEvidence,
    allRepositories,
  };
}
