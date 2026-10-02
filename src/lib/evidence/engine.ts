import type { GitHubEvidenceItem, GitHubRepository, ResumeClaim, SkillStatus } from "@/types";
import { normalizeSkill } from "@/lib/resume/normalize";
import {
  COMMIT_ONLY_MAX_SCORE,
  DIMINISHING_WEIGHTS,
  EVIDENCE_WEIGHTS,
  MAX_EVIDENCE_SCORE,
  MULTI_REPO_BONUS_2_REPOS,
  MULTI_REPO_BONUS_3_PLUS_REPOS,
  MULTI_SIGNAL_BONUS,
  PARTIAL_MINIMUM_SCORE,
  PROVEN_MINIMUM_SCORE,
  README_ONLY_MAX_SCORE,
  STRONG_TECHNICAL_TYPES,
} from "./config";
import type { EvidenceEngineResult, SkillVerificationResult } from "./types";

/**
 * Normalizes a target skill name to its canonical taxonomy form and associated aliases.
 */
function resolveSkillTarget(skillInput: string | ResumeClaim): {
  canonicalName: string;
  aliases: string[];
} {
  const rawName = typeof skillInput === "string" ? skillInput : skillInput.canonicalSkill || skillInput.displayName;
  const taxonomyMatch = normalizeSkill(rawName);

  if (taxonomyMatch) {
    return {
      canonicalName: taxonomyMatch.canonicalName,
      aliases: [...taxonomyMatch.aliases],
    };
  }

  return {
    canonicalName: rawName.trim(),
    aliases: [],
  };
}

/**
 * Normalizes strings for robust case-insensitive comparison,
 * respecting case sensitivity for short 1-2 character tokens (e.g. C, Go).
 */
function skillStringsMatch(target: string, candidate: string): boolean {
  const t = target.trim();
  const c = candidate.trim();
  if (t === c) return true;

  const caseSensitive = ["C", "Go", "JS", "TS", "ML"].includes(t);
  if (caseSensitive) {
    return t === c;
  }

  return t.toLowerCase() === c.toLowerCase();
}

/**
 * Deterministically checks if a factual GitHub evidence item matches a target skill.
 */
function evidenceMatchesSkill(
  item: GitHubEvidenceItem,
  canonicalName: string,
  aliases: string[]
): boolean {
  const targetNames = [canonicalName, ...aliases];

  // 1. Direct match in skillHints
  if (item.skillHints && item.skillHints.length > 0) {
    for (const hint of item.skillHints) {
      if (targetNames.some((target) => skillStringsMatch(target, hint))) {
        return true;
      }
    }
  }

  // 2. Type-specific deterministic matching
  const lowerCanonical = canonicalName.toLowerCase();

  // Docker
  if (lowerCanonical === "docker") {
    if (item.type === "dockerfile" || item.type === "docker_compose") {
      return true;
    }
  }

  // Kubernetes
  if (lowerCanonical === "kubernetes") {
    if (item.type === "kubernetes_manifest") {
      return true;
    }
  }

  // CI/CD and GitHub Actions
  if (lowerCanonical === "ci/cd" || lowerCanonical === "github actions") {
    if (item.type === "ci_cd") {
      return true;
    }
  }

  // Git
  if (lowerCanonical === "git") {
    if (item.type === "commit_recency") {
      return true;
    }
  }

  // 3. Language matching
  if (item.type === "repository_language") {
    if (targetNames.some((target) => skillStringsMatch(target, item.extractedFact))) {
      return true;
    }
  }

  // 4. README documentation mention matching
  if (item.type === "readme") {
    const fact = item.extractedFact.toLowerCase();
    if (targetNames.some((t) => fact.includes(t.toLowerCase()))) {
      return true;
    }
  }

  return false;
}

/**
 * Deduplicates an array of evidence items based on their unique factual identity.
 * Prevents identical repeated evidence from artificially inflating confidence scores.
 */
export function deduplicateEvidence(items: GitHubEvidenceItem[]): GitHubEvidenceItem[] {
  const seen = new Set<string>();
  const deduplicated: GitHubEvidenceItem[] = [];

  for (const item of items) {
    const key = [
      item.repositoryName || item.repositoryId || "unknown_repo",
      item.type,
      item.filePath || "no_path",
      item.commitSha || "no_sha",
      item.extractedFact.trim().toLowerCase(),
      item.sourceUrl,
    ].join("::");

    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(item);
    }
  }

  return deduplicated;
}

/**
 * Formats a list of signal types into human-readable English for explainability.
 */
function formatSignalTypes(types: Set<string>): string {
  const labels: Record<string, string> = {
    repository_language: "source code language",
    dependency: "manifest dependencies",
    framework: "framework configuration",
    test: "automated tests",
    dockerfile: "Docker container specifications",
    docker_compose: "Docker Compose orchestration",
    kubernetes_manifest: "Kubernetes manifests",
    cloud_configuration: "cloud infrastructure files",
    ci_cd: "CI/CD pipelines",
    package_manifest: "package manifests",
    commit_recency: "recent commit history",
    readme: "project documentation (README)",
  };

  const formatted = Array.from(types).map((t) => labels[t] || t);
  if (formatted.length === 0) return "no direct technical signals";
  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]} and ${formatted[1]}`;
  return `${formatted.slice(0, -1).join(", ")}, and ${formatted[formatted.length - 1]}`;
}

/**
 * Evaluates a single resume skill claim against a set of factual GitHub evidence items.
 */
export function evaluateSkillClaim(
  skillInput: ResumeClaim | string,
  rawEvidence: GitHubEvidenceItem[],
  repositories: GitHubRepository[] = []
): SkillVerificationResult {
  const { canonicalName, aliases } = resolveSkillTarget(skillInput);

  // 1. Deduplicate input evidence first (Requirement 9 & Test 7)
  const cleanEvidence = deduplicateEvidence(rawEvidence);

  // 2. Filter evidence items that factually match this skill
  const matchedEvidence = cleanEvidence.filter((item) =>
    evidenceMatchesSkill(item, canonicalName, aliases)
  );

  // Check if repository metadata alone mentions this skill (Test 6)
  const matchingRepoNames = repositories
    .filter((repo) => {
      const lower = repo.name.toLowerCase();
      const targetLower = canonicalName.toLowerCase();
      return lower.includes(targetLower) || aliases.some((a) => lower.includes(a.toLowerCase()));
    })
    .map((r) => r.name);

  // If no matching technical evidence exists:
  if (matchedEvidence.length === 0) {
    // If only repository name mentioned it without factual technical evidence (Safety Rule 8 & Test 6)
    if (matchingRepoNames.length > 0) {
      return {
        skill: canonicalName,
        status: "CLAIMED_ONLY",
        evidenceScore: 5,
        reason: `${canonicalName} was referenced only in a repository name (${matchingRepoNames[0]}), with zero direct source code, dependency, or configuration evidence found.`,
        evidenceItems: [],
        repositoryCount: 0,
        distinctSignalTypes: [],
      };
    }

    // Default CLAIMED_ONLY (Requirement 4 & Test 3, 8)
    return {
      skill: canonicalName,
      status: "CLAIMED_ONLY",
      evidenceScore: 0,
      reason: "No sufficient GitHub evidence was found to verify this resume claim.",
      evidenceItems: [],
      repositoryCount: 0,
      distinctSignalTypes: [],
    };
  }

  // 3. Compute distinct signal types and repository distribution
  const distinctRepos = new Set(
    matchedEvidence.map((i) => i.repositoryName).filter((name): name is string => Boolean(name))
  );
  const signalTypes = new Set(matchedEvidence.map((i) => i.type));

  // 4. Calculate deterministic weighted score with diminishing returns
  let rawScore = 0;
  const repoTypeCounts = new Map<string, number>();

  for (const item of matchedEvidence) {
    const baseWeight = EVIDENCE_WEIGHTS[item.type] ?? 10;
    const repoKey = `${item.repositoryName || "default"}::${item.type}`;
    const previousCount = repoTypeCounts.get(repoKey) || 0;
    repoTypeCounts.set(repoKey, previousCount + 1);

    const multiplier =
      previousCount < DIMINISHING_WEIGHTS.length
        ? DIMINISHING_WEIGHTS[previousCount]
        : DIMINISHING_WEIGHTS[DIMINISHING_WEIGHTS.length - 1];

    rawScore += baseWeight * multiplier;
  }

  // Multi-repository corroboration bonus
  if (distinctRepos.size >= 3) {
    rawScore += MULTI_REPO_BONUS_3_PLUS_REPOS;
  } else if (distinctRepos.size >= 2) {
    rawScore += MULTI_REPO_BONUS_2_REPOS;
  }

  // Multi-signal diversity bonus
  if (signalTypes.size >= 3) {
    rawScore += MULTI_SIGNAL_BONUS;
  }

  // 5. Evaluate safety rules and constraints
  const isReadmeOnly = matchedEvidence.every((item) => item.type === "readme");
  const isCommitOnly = matchedEvidence.every((item) => item.type === "commit_recency");
  const hasStrongTechnicalSignal = matchedEvidence.some((item) =>
    STRONG_TECHNICAL_TYPES.has(item.type)
  );

  let finalScore = Math.min(Math.round(rawScore), MAX_EVIDENCE_SCORE);

  // Safety Rule: README-only evidence must never exceed PARTIAL or score above 25 (Rule 6, Test 2)
  if (isReadmeOnly) {
    finalScore = Math.min(finalScore, README_ONLY_MAX_SCORE);
  }

  // Safety Rule: Commit-only evidence must never exceed PARTIAL or score above 20 (Rule 7, Test 5)
  if (isCommitOnly) {
    finalScore = Math.min(finalScore, COMMIT_ONLY_MAX_SCORE);
  }

  // 6. Assign status deterministically
  let status: SkillStatus = "CLAIMED_ONLY";
  const repoCount = distinctRepos.size;

  const meetsMultiSignal =
    signalTypes.size >= 2 ||
    repoCount >= 2 ||
    (matchedEvidence.length >= 2 && hasStrongTechnicalSignal);

  if (
    finalScore >= PROVEN_MINIMUM_SCORE &&
    hasStrongTechnicalSignal &&
    meetsMultiSignal &&
    !isReadmeOnly &&
    !isCommitOnly
  ) {
    status = "PROVEN";
  } else if (finalScore >= PARTIAL_MINIMUM_SCORE) {
    status = "PARTIAL";
  } else {
    status = "CLAIMED_ONLY";
  }

  // 7. Generate explainable reason (Requirement 3)
  const signalsSummary = formatSignalTypes(signalTypes);
  let reason = "";

  if (status === "PROVEN") {
    reason = `${canonicalName} is supported by direct technical evidence, including ${signalsSummary} across ${repoCount} ${
      repoCount === 1 ? "repository" : "public repositories"
    }.`;
  } else if (status === "PARTIAL") {
    if (isReadmeOnly) {
      reason = `${canonicalName} is mentioned in repository documentation (README), but lacks direct implementation, dependency, or configuration evidence.`;
    } else if (isCommitOnly) {
      reason = `${canonicalName} is referenced in commit activity, but lacks direct code implementation, manifest dependencies, or configuration evidence.`;
    } else {
      reason = `${canonicalName} has partial supporting evidence (${signalsSummary}), but lacks the multi-signal depth or repository volume required for full verification.`;
    }
  } else {
    reason = "No sufficient GitHub evidence was found to verify this resume claim.";
  }

  return {
    skill: canonicalName,
    status,
    evidenceScore: finalScore,
    reason,
    evidenceItems: matchedEvidence,
    repositoryCount: repoCount,
    distinctSignalTypes: Array.from(signalTypes),
  };
}

/**
 * Evaluates all confirmed resume claims against factual GitHub evidence.
 */
export function evaluateEvidence(
  claims: (ResumeClaim | string)[],
  evidence: GitHubEvidenceItem[],
  repositories: GitHubRepository[] = []
): EvidenceEngineResult {
  const evaluatedAt = new Date().toISOString();
  const verifications: SkillVerificationResult[] = [];

  let provenCount = 0;
  let partialCount = 0;
  let claimedOnlyCount = 0;
  let totalScore = 0;

  for (const claim of claims) {
    const result = evaluateSkillClaim(claim, evidence, repositories);
    verifications.push(result);

    if (result.status === "PROVEN") provenCount++;
    else if (result.status === "PARTIAL") partialCount++;
    else claimedOnlyCount++;

    totalScore += result.evidenceScore;
  }

  const averageScore = claims.length > 0 ? Math.round(totalScore / claims.length) : 0;

  return {
    evaluatedAt,
    summary: {
      totalClaims: claims.length,
      provenCount,
      partialCount,
      claimedOnlyCount,
      averageScore,
    },
    verifications,
  };
}
