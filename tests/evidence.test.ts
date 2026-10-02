import { describe, expect, it } from "vitest";
import { evaluateSkillClaim, evaluateEvidence, deduplicateEvidence } from "../src/lib/evidence";
import type { GitHubEvidenceItem, GitHubRepository, ResumeClaim } from "../src/types";

function createEvidenceItem(overrides: Partial<GitHubEvidenceItem> = {}): GitHubEvidenceItem {
  return {
    id: crypto.randomUUID(),
    type: "dependency",
    skillHints: [],
    sourceUrl: "https://github.com/example/repo",
    extractedFact: "Generic fact",
    collectedAt: "2026-10-02T10:00:00Z",
    analyzerVersion: "1.0.0",
    repositoryName: "default-repo",
    ...overrides,
  };
}

describe("Deterministic Evidence Engine Unit Tests", () => {
  // ==========================================
  // TEST 1: Strong React evidence -> PROVEN
  // ==========================================
  it("TEST 1: Strong React evidence with dependencies, language, multiple repos, and commits produces PROVEN", () => {
    const evidence: GitHubEvidenceItem[] = [
      createEvidenceItem({
        repositoryName: "frontend-dashboard",
        type: "dependency",
        skillHints: ["React"],
        filePath: "package.json",
        sourceUrl: "https://github.com/user/frontend-dashboard/blob/main/package.json",
        extractedFact: "react dependency detected (npm).",
      }),
      createEvidenceItem({
        repositoryName: "frontend-dashboard",
        type: "repository_language",
        skillHints: ["TypeScript", "React"],
        sourceUrl: "https://github.com/user/frontend-dashboard",
        extractedFact: "TypeScript detected as repository language (85% of codebase).",
      }),
      createEvidenceItem({
        repositoryName: "ecommerce-store",
        type: "dependency",
        skillHints: ["React"],
        filePath: "package.json",
        sourceUrl: "https://github.com/user/ecommerce-store/blob/main/package.json",
        extractedFact: "react dependency detected (npm).",
      }),
      createEvidenceItem({
        repositoryName: "frontend-dashboard",
        type: "commit_recency",
        skillHints: ["Git", "React"],
        sourceUrl: "https://github.com/user/frontend-dashboard/commit/123",
        extractedFact: "Recent commit on 2026-09-20: 'feat: add React UI components'.",
      }),
    ];

    const result = evaluateSkillClaim("React", evidence);
    expect(result.status).toBe("PROVEN");
    expect(result.evidenceScore).toBeGreaterThanOrEqual(60);
    expect(result.evidenceItems.length).toBeGreaterThanOrEqual(3);
    expect(result.repositoryCount).toBe(2);
    expect(result.reason).toContain("React is supported by direct technical evidence");
    // Ensure no expertise statements
    expect(result.reason).not.toContain("expert");
  });

  // ==========================================
  // TEST 2: README-only AWS evidence -> NOT PROVEN (PARTIAL)
  // ==========================================
  it("TEST 2: README-only AWS evidence cannot produce PROVEN (safety rule: capped at PARTIAL)", () => {
    const evidence: GitHubEvidenceItem[] = [
      createEvidenceItem({
        repositoryName: "demo-project",
        type: "readme",
        filePath: "README.md",
        skillHints: ["AWS", "Documentation"],
        sourceUrl: "https://github.com/user/demo-project#readme",
        extractedFact: "Project documentation detected (mentions AWS architecture).",
      }),
    ];

    const result = evaluateSkillClaim("AWS", evidence);
    expect(result.status).not.toBe("PROVEN");
    expect(result.status).toBe("PARTIAL");
    expect(result.evidenceScore).toBeLessThanOrEqual(25);
    expect(result.reason).toContain("README");
    expect(result.reason).toContain("lacks direct");
  });

  // ==========================================
  // TEST 3: Resume-only Kubernetes claim -> CLAIMED_ONLY
  // ==========================================
  it("TEST 3: Resume-only Kubernetes claim with zero GitHub evidence produces CLAIMED_ONLY", () => {
    const evidence: GitHubEvidenceItem[] = [
      createEvidenceItem({
        repositoryName: "python-repo",
        type: "dependency",
        skillHints: ["Python"],
        extractedFact: "requests dependency detected.",
      }),
    ];

    const result = evaluateSkillClaim("Kubernetes", evidence);
    expect(result.status).toBe("CLAIMED_ONLY");
    expect(result.evidenceScore).toBe(0);
    expect(result.evidenceItems).toHaveLength(0);
    expect(result.reason).toBe("No sufficient GitHub evidence was found to verify this resume claim.");
  });

  // ==========================================
  // TEST 4: Multiple Python repositories -> PROVEN
  // ==========================================
  it("TEST 4: Multiple Python repositories with language, dependencies, and commits produces PROVEN", () => {
    const evidence: GitHubEvidenceItem[] = [
      createEvidenceItem({
        repositoryName: "api-service",
        type: "repository_language",
        skillHints: ["Python"],
        sourceUrl: "https://github.com/user/api-service",
        extractedFact: "Python detected as repository language (90% of codebase).",
      }),
      createEvidenceItem({
        repositoryName: "api-service",
        type: "dependency",
        skillHints: ["Python"],
        filePath: "requirements.txt",
        sourceUrl: "https://github.com/user/api-service/blob/main/requirements.txt",
        extractedFact: "fastapi Python dependency detected.",
      }),
      createEvidenceItem({
        repositoryName: "data-pipeline",
        type: "repository_language",
        skillHints: ["Python"],
        sourceUrl: "https://github.com/user/data-pipeline",
        extractedFact: "Python detected as repository language (80% of codebase).",
      }),
      createEvidenceItem({
        repositoryName: "data-pipeline",
        type: "dependency",
        skillHints: ["Python"],
        filePath: "requirements.txt",
        sourceUrl: "https://github.com/user/data-pipeline/blob/main/requirements.txt",
        extractedFact: "pandas Python dependency detected.",
      }),
      createEvidenceItem({
        repositoryName: "api-service",
        type: "commit_recency",
        skillHints: ["Python", "Git"],
        sourceUrl: "https://github.com/user/api-service/commit/456",
        extractedFact: "Recent commit on 2026-09-18: 'feat: add Python endpoints'.",
      }),
    ];

    const result = evaluateSkillClaim("Python", evidence);
    expect(result.status).toBe("PROVEN");
    expect(result.evidenceScore).toBeGreaterThanOrEqual(60);
    expect(result.repositoryCount).toBe(2);
    expect(result.reason).toContain("Python is supported by direct technical evidence");
  });

  // ==========================================
  // TEST 5: Commit-only evidence -> NOT PROVEN
  // ==========================================
  it("TEST 5: Commit-only evidence cannot produce PROVEN even with multiple commits", () => {
    const evidence: GitHubEvidenceItem[] = [
      createEvidenceItem({
        repositoryName: "random-repo",
        type: "commit_recency",
        skillHints: ["TypeScript"],
        commitSha: "sha1",
        extractedFact: "Recent commit: 'refactor TypeScript files'.",
      }),
      createEvidenceItem({
        repositoryName: "random-repo",
        type: "commit_recency",
        skillHints: ["TypeScript"],
        commitSha: "sha2",
        extractedFact: "Recent commit: 'update TypeScript types'.",
      }),
      createEvidenceItem({
        repositoryName: "random-repo",
        type: "commit_recency",
        skillHints: ["TypeScript"],
        commitSha: "sha3",
        extractedFact: "Recent commit: 'fix TypeScript build'.",
      }),
    ];

    const result = evaluateSkillClaim("TypeScript", evidence);
    expect(result.status).not.toBe("PROVEN");
    expect(result.status).toBe("PARTIAL");
    expect(result.evidenceScore).toBeLessThanOrEqual(20);
    expect(result.reason).toContain("commit activity");
  });

  // ==========================================
  // TEST 6: Repository-name-only evidence -> NOT PROVEN
  // ==========================================
  it("TEST 6: Repository name alone cannot produce PROVEN (safety rule: CLAIMED_ONLY without technical evidence)", () => {
    const repositories: GitHubRepository[] = [
      {
        id: 999,
        name: "react-project",
        fullName: "user/react-project",
        htmlUrl: "https://github.com/user/react-project",
        description: "Empty repository named after react",
        isPrivate: false,
        isFork: false,
        isArchived: false,
        defaultBranch: "main",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        pushedAt: "2024-01-01",
        stargazersCount: 0,
        forksCount: 0,
        language: null,
        topics: [],
      },
    ];

    const evidence: GitHubEvidenceItem[] = []; // No technical evidence inside
    const result = evaluateSkillClaim("React", evidence, repositories);

    expect(result.status).not.toBe("PROVEN");
    expect(result.status).toBe("CLAIMED_ONLY");
    expect(result.evidenceScore).toBeLessThanOrEqual(10);
    expect(result.reason).toContain("referenced only in a repository name");
  });

  // ==========================================
  // TEST 7: Duplicate evidence -> score not inflated
  // ==========================================
  it("TEST 7: Duplicate evidence items are deduplicated and do not inflate the score", () => {
    const singleItem = createEvidenceItem({
      repositoryName: "app",
      type: "dependency",
      skillHints: ["Docker"],
      filePath: "Dockerfile",
      sourceUrl: "https://github.com/user/app/blob/main/Dockerfile",
      extractedFact: "Dockerfile detected.",
    });

    const singleResult = evaluateSkillClaim("Docker", [singleItem]);

    // Pass the identical item 5 times
    const duplicatedEvidence = [singleItem, singleItem, singleItem, singleItem, singleItem];
    const deduplicatedResult = evaluateSkillClaim("Docker", duplicatedEvidence);

    // Score must be identical
    expect(deduplicatedResult.evidenceScore).toBe(singleResult.evidenceScore);
    expect(deduplicatedResult.evidenceItems).toHaveLength(1);
    expect(deduplicateEvidence(duplicatedEvidence)).toHaveLength(1);
  });

  // ==========================================
  // TEST 8: Unknown skill -> CLAIMED_ONLY
  // ==========================================
  it("TEST 8: Unknown skill with zero GitHub evidence produces CLAIMED_ONLY", () => {
    const evidence: GitHubEvidenceItem[] = [
      createEvidenceItem({
        repositoryName: "app",
        type: "dependency",
        skillHints: ["React"],
        extractedFact: "react dependency detected.",
      }),
    ];

    const result = evaluateSkillClaim("SomeTechnologyXYZ", evidence);
    expect(result.status).toBe("CLAIMED_ONLY");
    expect(result.evidenceScore).toBe(0);
    expect(result.evidenceItems).toHaveLength(0);
    expect(result.reason).toBe("No sufficient GitHub evidence was found to verify this resume claim.");
  });

  // ==========================================
  // Additional Test: evaluateEvidence full run
  // ==========================================
  it("evaluates a collection of resume claims and produces summary metrics", () => {
    const claims: ResumeClaim[] = [
      {
        id: "1",
        canonicalSkill: "React",
        displayName: "React",
        category: "Frontend",
        sourceSection: "SKILLS",
        sourceText: "React developer",
        confidence: 1,
        status: "UNVERIFIED",
      },
      {
        id: "2",
        canonicalSkill: "Kubernetes",
        displayName: "Kubernetes",
        category: "DevOps",
        sourceSection: "SKILLS",
        sourceText: "Kubernetes experience",
        confidence: 1,
        status: "UNVERIFIED",
      },
    ];

    const evidence: GitHubEvidenceItem[] = [
      createEvidenceItem({
        repositoryName: "repo-1",
        type: "dependency",
        skillHints: ["React"],
        sourceUrl: "https://github.com/user/repo-1/package.json",
        extractedFact: "react dependency detected.",
      }),
      createEvidenceItem({
        repositoryName: "repo-2",
        type: "dependency",
        skillHints: ["React"],
        sourceUrl: "https://github.com/user/repo-2/package.json",
        extractedFact: "react dependency detected.",
      }),
      createEvidenceItem({
        repositoryName: "repo-1",
        type: "repository_language",
        skillHints: ["React", "JavaScript"],
        sourceUrl: "https://github.com/user/repo-1",
        extractedFact: "JavaScript detected as repository language.",
      }),
    ];

    const summary = evaluateEvidence(claims, evidence);
    expect(summary.summary.totalClaims).toBe(2);
    expect(summary.summary.provenCount).toBe(1); // React
    expect(summary.summary.claimedOnlyCount).toBe(1); // Kubernetes
    expect(summary.summary.partialCount).toBe(0);
    expect(summary.verifications).toHaveLength(2);
  });
});
