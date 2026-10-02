import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { parseGitHubRepoUrl, GitHubUrlError } from "@/lib/github/parse-url";
import { computeEvidenceDiff, getEvidenceKey } from "@/lib/tasks/diff";
import { reverifyTaskSubmission } from "@/lib/tasks/reverify";
import { applySubmissionToSession } from "@/lib/evidence/session";
import { GitHubApiError, GitHubRateLimitError, type GitHubClient } from "@/lib/github/client";
import { POST as submissionRoute } from "@/app/api/tasks/submissions/route";
import type { GitHubEvidenceItem, GitHubRepository } from "@/types";
import type { SkillVerificationResult } from "@/lib/evidence/types";
import type { CandidateVerificationSession } from "@/lib/evidence/session";

// Mock server-only so tests run smoothly
vi.mock("server-only", () => ({}));

// -------------------------------------------------------------
// Fixtures
// -------------------------------------------------------------
const SAMPLE_REPO: GitHubRepository = {
  id: 12345678,
  name: "docker-demo",
  fullName: "candidate/docker-demo",
  htmlUrl: "https://github.com/candidate/docker-demo",
  description: "A docker demo repository",
  isPrivate: false,
  isFork: false,
  isArchived: false,
  defaultBranch: "main",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-06-01T00:00:00Z",
  pushedAt: "2024-06-01T00:00:00Z",
  stargazersCount: 5,
  forksCount: 0,
  language: "Python",
  topics: ["docker", "python"],
};

const DOCKERFILE_EVIDENCE: GitHubEvidenceItem = {
  id: "ev-dockerfile-1",
  repositoryId: "12345678",
  repositoryName: "docker-demo",
  type: "dockerfile",
  filePath: "Dockerfile",
  skillHints: ["Docker"],
  sourceUrl: "https://github.com/candidate/docker-demo/blob/main/Dockerfile",
  extractedFact: "Dockerfile detected for containerized deployment.",
  collectedAt: "2024-06-01T00:00:00Z",
  analyzerVersion: "1.0.0",
};

const DOCKER_COMPOSE_EVIDENCE: GitHubEvidenceItem = {
  id: "ev-compose-1",
  repositoryId: "12345678",
  repositoryName: "docker-demo",
  type: "docker_compose",
  filePath: "docker-compose.yml",
  skillHints: ["Docker"],
  sourceUrl: "https://github.com/candidate/docker-demo/blob/main/docker-compose.yml",
  extractedFact: "docker-compose.yml configuration detected.",
  collectedAt: "2024-06-01T00:00:00Z",
  analyzerVersion: "1.0.0",
};

const CICD_EVIDENCE: GitHubEvidenceItem = {
  id: "ev-ci-1",
  repositoryId: "12345678",
  repositoryName: "docker-demo",
  type: "ci_cd",
  filePath: ".github/workflows/build.yml",
  skillHints: ["Docker", "CI/CD"],
  sourceUrl: "https://github.com/candidate/docker-demo/blob/main/.github/workflows/build.yml",
  extractedFact: "GitHub Actions CI/CD workflow detected.",
  collectedAt: "2024-06-01T00:00:00Z",
  analyzerVersion: "1.0.0",
};

// -------------------------------------------------------------
// Test Suite
// -------------------------------------------------------------
describe("Phase 10 — GitHub URL Parsing & Validation", () => {
  it("parses standard HTTPS GitHub repository URLs", () => {
    const result = parseGitHubRepoUrl("https://github.com/facebook/react");
    expect(result.owner).toBe("facebook");
    expect(result.repo).toBe("react");
    expect(result.normalizedUrl).toBe("https://github.com/facebook/react");
  });

  it("handles URLs with trailing slashes and .git extensions", () => {
    const result = parseGitHubRepoUrl("https://github.com/vercel/next.js.git/");
    expect(result.owner).toBe("vercel");
    expect(result.repo).toBe("next.js");
    expect(result.normalizedUrl).toBe("https://github.com/vercel/next.js");
  });

  it("handles URLs without protocol scheme", () => {
    const result = parseGitHubRepoUrl("github.com/torvalds/linux");
    expect(result.owner).toBe("torvalds");
    expect(result.repo).toBe("linux");
  });

  it("rejects non-GitHub domains", () => {
    expect(() => parseGitHubRepoUrl("https://gitlab.com/owner/repo")).toThrow(GitHubUrlError);
    expect(() => parseGitHubRepoUrl("https://bitbucket.org/owner/repo")).toThrow(GitHubUrlError);
    expect(() => parseGitHubRepoUrl("https://malicious-site.com/github.com/owner/repo")).toThrow(GitHubUrlError);
  });

  it("rejects empty or missing repository paths", () => {
    expect(() => parseGitHubRepoUrl("")).toThrow(GitHubUrlError);
    expect(() => parseGitHubRepoUrl("https://github.com")).toThrow(GitHubUrlError);
    expect(() => parseGitHubRepoUrl("https://github.com/justowner")).toThrow(GitHubUrlError);
  });

  it("rejects invalid characters in owner or repository name", () => {
    expect(() => parseGitHubRepoUrl("https://github.com/owner!/repo")).toThrow(GitHubUrlError);
    expect(() => parseGitHubRepoUrl("https://github.com/owner/repo?arg=1")).toThrow(GitHubUrlError);
  });
});

describe("Phase 10 — Deterministic Evidence Diffing", () => {
  it("correctly identifies newly added evidence vs unchanged evidence", () => {
    const prevVerification: SkillVerificationResult = {
      skill: "Docker",
      status: "PARTIAL",
      evidenceScore: 35,
      reason: "Partial evidence",
      evidenceItems: [DOCKERFILE_EVIDENCE],
      repositoryCount: 1,
      distinctSignalTypes: ["dockerfile"],
    };

    const newVerification: SkillVerificationResult = {
      skill: "Docker",
      status: "PROVEN",
      evidenceScore: 80,
      reason: "Proven evidence",
      evidenceItems: [DOCKERFILE_EVIDENCE, DOCKER_COMPOSE_EVIDENCE],
      repositoryCount: 1,
      distinctSignalTypes: ["dockerfile", "docker_compose"],
    };

    const diff = computeEvidenceDiff(
      [DOCKERFILE_EVIDENCE],
      [DOCKERFILE_EVIDENCE, DOCKER_COMPOSE_EVIDENCE],
      prevVerification,
      newVerification
    );

    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].type).toBe("docker_compose");
    expect(diff.unchanged).toHaveLength(1);
    expect(diff.unchanged[0].type).toBe("dockerfile");
    expect(diff.removed).toHaveLength(0);
    expect(diff.previousScore).toBe(35);
    expect(diff.newScore).toBe(80);
    expect(diff.scoreDelta).toBe(45);
    expect(diff.previousStatus).toBe("PARTIAL");
    expect(diff.newStatus).toBe("PROVEN");
    expect(diff.reasons.length).toBeGreaterThan(0);
    expect(diff.reasons.some((r) => r.includes("PROVEN"))).toBe(true);
  });

  it("does not duplicate evidence items with identical identity keys", () => {
    const key1 = getEvidenceKey(DOCKERFILE_EVIDENCE);
    const duplicateItem: GitHubEvidenceItem = {
      ...DOCKERFILE_EVIDENCE,
      id: "ev-different-uuid", // Different ID but same repo/type/path/fact
    };
    const key2 = getEvidenceKey(duplicateItem);
    expect(key1).toBe(key2);
  });
});

describe("Phase 10 — Re-verification Engine Execution", () => {
  it("transitions CLAIMED_ONLY → PARTIAL when repository provides initial technical evidence", async () => {
    const mockClient = {
      getRepository: vi.fn().mockResolvedValue(SAMPLE_REPO),
      getLanguages: vi.fn().mockResolvedValue({ Python: 5000 }),
      getReadme: vi.fn().mockResolvedValue({ exists: false }),
      getTree: vi.fn().mockResolvedValue([
        { path: "Dockerfile", type: "blob" },
      ]),
      getFileContent: vi.fn().mockResolvedValue(null),
      getCommits: vi.fn().mockResolvedValue([]),
    } as unknown as GitHubClient;

    const result = await reverifyTaskSubmission({
      taskId: "task-1",
      skill: "Docker",
      repositoryUrl: "https://github.com/candidate/docker-demo",
      existingEvidence: [],
      existingRepositories: [],
      client: mockClient,
    });

    expect(result.submission.beforeVerification.status).toBe("CLAIMED_ONLY");
    expect(result.submission.afterVerification.status).toBe("PARTIAL");
    expect(result.submission.afterVerification.evidenceScore).toBeGreaterThanOrEqual(25);
    expect(result.submission.evidenceDiff.scoreDelta).toBeGreaterThan(0);
    expect(result.submission.status).toBe("VERIFICATION_UPDATED");
  });

  it("transitions PARTIAL → PROVEN when new repository satisfies multi-signal Phase 4 rules", async () => {
    // Starts with Dockerfile only (PARTIAL)
    const initialEvidence: GitHubEvidenceItem[] = [DOCKERFILE_EVIDENCE];

    const mockClient = {
      getRepository: vi.fn().mockResolvedValue(SAMPLE_REPO),
      getLanguages: vi.fn().mockResolvedValue({ Python: 10000 }),
      getReadme: vi.fn().mockResolvedValue({ exists: true, size: 500, htmlUrl: "https://github.com/..." }),
      getTree: vi.fn().mockResolvedValue([
        { path: "Dockerfile", type: "blob" },
        { path: "docker-compose.yml", type: "blob" },
        { path: ".github/workflows/deploy.yml", type: "blob" },
      ]),
      getFileContent: vi.fn().mockResolvedValue(null),
      getCommits: vi.fn().mockResolvedValue([
        { sha: "abc", message: "configure docker container and ci pipeline", date: "2024-06-01T00:00:00Z", url: "https://..." },
      ]),
    } as unknown as GitHubClient;

    const result = await reverifyTaskSubmission({
      taskId: "task-1",
      skill: "Docker",
      repositoryUrl: "https://github.com/candidate/docker-demo",
      existingEvidence: initialEvidence,
      existingRepositories: [SAMPLE_REPO],
      client: mockClient,
    });

    expect(result.submission.beforeVerification.status).toBe("PARTIAL");
    expect(result.submission.afterVerification.status).toBe("PROVEN");
    expect(result.submission.afterVerification.evidenceScore).toBeGreaterThanOrEqual(60);
    expect(result.submission.evidenceDiff.added.length).toBeGreaterThan(0);
  });

  it("leaves PARTIAL as PARTIAL when additional evidence does not reach PROVEN threshold", async () => {
    const initialEvidence: GitHubEvidenceItem[] = [DOCKERFILE_EVIDENCE];

    // Submitted repo only has a readme mentioning docker
    const mockClient = {
      getRepository: vi.fn().mockResolvedValue(SAMPLE_REPO),
      getLanguages: vi.fn().mockResolvedValue({ Python: 500 }),
      getReadme: vi.fn().mockResolvedValue({ exists: true, size: 200, htmlUrl: "https://..." }),
      getTree: vi.fn().mockResolvedValue([
        { path: "README.md", type: "blob" },
      ]),
      getFileContent: vi.fn().mockResolvedValue(null),
      getCommits: vi.fn().mockResolvedValue([]),
    } as unknown as GitHubClient;

    const result = await reverifyTaskSubmission({
      taskId: "task-1",
      skill: "Docker",
      repositoryUrl: "https://github.com/candidate/docker-demo",
      existingEvidence: initialEvidence,
      existingRepositories: [SAMPLE_REPO],
      client: mockClient,
    });

    expect(result.submission.afterVerification.status).toBe("PARTIAL");
  });

  it("handles a submission where no technical evidence for the target skill exists", async () => {
    const UNRELATED_REPO: GitHubRepository = {
      ...SAMPLE_REPO,
      name: "vanilla-portfolio",
      fullName: "candidate/vanilla-portfolio",
      topics: [],
    };

    // Empty repo without docker artifacts or name mentions
    const mockClient = {
      getRepository: vi.fn().mockResolvedValue(UNRELATED_REPO),
      getLanguages: vi.fn().mockResolvedValue({}),
      getReadme: vi.fn().mockResolvedValue({ exists: false }),
      getTree: vi.fn().mockResolvedValue([]),
      getFileContent: vi.fn().mockResolvedValue(null),
      getCommits: vi.fn().mockResolvedValue([]),
    } as unknown as GitHubClient;

    const result = await reverifyTaskSubmission({
      taskId: "task-1",
      skill: "Docker",
      repositoryUrl: "https://github.com/candidate/vanilla-portfolio",
      existingEvidence: [],
      existingRepositories: [],
      client: mockClient,
    });

    expect(result.submission.afterVerification.status).toBe("CLAIMED_ONLY");
    expect(result.submission.evidenceDiff.added).toHaveLength(0);
    expect(result.submission.evidenceDiff.reasons.some((r) => r.includes("No new technical signals"))).toBe(true);
  });

  it("maps task acceptance criteria without overriding deterministic score", async () => {
    const mockClient = {
      getRepository: vi.fn().mockResolvedValue(SAMPLE_REPO),
      getLanguages: vi.fn().mockResolvedValue({ Python: 5000 }),
      getReadme: vi.fn().mockResolvedValue({ exists: false }),
      getTree: vi.fn().mockResolvedValue([
        { path: "Dockerfile", type: "blob" },
      ]),
      getFileContent: vi.fn().mockResolvedValue(null),
      getCommits: vi.fn().mockResolvedValue([]),
    } as unknown as GitHubClient;

    const result = await reverifyTaskSubmission({
      taskId: "task-1",
      skill: "Docker",
      repositoryUrl: "https://github.com/candidate/docker-demo",
      task: {
        id: "task-1",
        skill: "Docker",
        title: "Dockerize app",
        objective: "Test objective",
        scenario: "Test scenario",
        requirements: ["Provide Dockerfile", "Provide CI"],
        steps: ["Step 1"],
        deliverables: ["Dockerfile"],
        acceptanceCriteria: [
          "Dockerfile container image build definition",
          "Kubernetes deployment manifest",
        ],
        suggestedTechnologies: ["Docker"],
        estimatedTime: "45m",
        difficulty: "INTERMEDIATE",
        evidenceProduced: ["Dockerfile"],
        verificationHints: ["Dockerfile"],
        generatedAt: "2024-01-01T00:00:00Z",
      },
      client: mockClient,
    });

    const criteria = result.submission.criteriaAssessment;
    expect(criteria).toHaveLength(2);
    // Dockerfile should be detected
    expect(criteria[0].detected).toBe(true);
    // Kubernetes should NOT be detected
    expect(criteria[1].detected).toBe(false);
  });
});

describe("Phase 10 — API Route POST /api/tasks/submissions", () => {
  it("rejects invalid or missing request body parameters", async () => {
    const req = new NextRequest("http://localhost:3000/api/tasks/submissions", {
      method: "POST",
      body: JSON.stringify({ skill: "Docker" }), // missing taskId and repositoryUrl
    });

    const res = await submissionRoute(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe("VALIDATION_ERROR");
  });

  it("rejects invalid non-GitHub URL with 400", async () => {
    const req = new NextRequest("http://localhost:3000/api/tasks/submissions", {
      method: "POST",
      body: JSON.stringify({
        taskId: "task-1",
        skill: "Docker",
        repositoryUrl: "https://gitlab.com/user/project",
      }),
    });

    const res = await submissionRoute(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe("INVALID_URL");
  });
});

describe("Phase 10 — Dashboard & Session Synchronization", () => {
  it("cleanly applies task re-verification to existing candidate session", () => {
    const prevSession: CandidateVerificationSession = {
      candidate: { name: "Alice Developer", email: "alice@example.com" },
      githubUsername: "alice",
      analyzedAt: "2024-01-01T00:00:00Z",
      claims: [
        {
          id: "claim-docker",
          displayName: "Docker",
          canonicalSkill: "Docker",
          category: "DevOps",
          sourceSection: "SKILLS",
          sourceText: "Experienced with Docker containerization",
          confidence: 1,
          status: "UNVERIFIED",
        },
      ],
      githubResult: {
        analysisRunId: "run-1",
        profile: {
          username: "alice",
          name: "Alice",
          profileUrl: "https://github.com/alice",
          avatarUrl: "",
          publicRepoCount: 1,
          followers: 1,
          following: 1,
          createdAt: "2020-01-01T00:00:00Z",
          bio: "",
        },
        repositories: [],
        evidence: [],
        summary: {
          repositoriesAnalyzed: 0,
          evidenceItems: 0,
          languagesDetected: [],
          topSkillHints: [],
        },
      },
      evaluation: {
        evaluatedAt: "2024-01-01T00:00:00Z",
        summary: {
          totalClaims: 1,
          provenCount: 0,
          partialCount: 1,
          claimedOnlyCount: 0,
          averageScore: 40,
        },
        verifications: [
          {
            skill: "Docker",
            status: "PARTIAL",
            evidenceScore: 40,
            reason: "Initial partial evidence",
            evidenceItems: [],
            repositoryCount: 0,
            distinctSignalTypes: [],
          },
        ],
      },
    };

    const updatedVerif: SkillVerificationResult = {
      skill: "Docker",
      status: "PROVEN",
      evidenceScore: 82,
      reason: "Upgraded with real container artifacts",
      evidenceItems: [DOCKERFILE_EVIDENCE, DOCKER_COMPOSE_EVIDENCE],
      repositoryCount: 1,
      distinctSignalTypes: ["dockerfile", "docker_compose"],
    };

    const updatedSession = applySubmissionToSession(
      prevSession,
      "Docker",
      updatedVerif,
      [DOCKERFILE_EVIDENCE, DOCKER_COMPOSE_EVIDENCE],
      [SAMPLE_REPO]
    );

    expect(updatedSession.evaluation.summary.provenCount).toBe(1);
    expect(updatedSession.evaluation.summary.partialCount).toBe(0);
    expect(updatedSession.evaluation.summary.averageScore).toBe(82);
    expect(updatedSession.evaluation.verifications[0].status).toBe("PROVEN");
    expect(updatedSession.githubResult.repositories).toHaveLength(1);
    expect(updatedSession.githubResult.evidence).toHaveLength(2);
  });
});

describe("Phase 10 — Target Skill Preservation & Status Stability", () => {
  it("preserves target skill and does not verify target if repo only contains unrelated skills", async () => {
    // Repo contains Go and Rust code, but task is for Docker
    const GO_REPO: GitHubRepository = {
      ...SAMPLE_REPO,
      name: "go-microservice",
      fullName: "candidate/go-microservice",
    };

    const mockClient = {
      getRepository: vi.fn().mockResolvedValue(GO_REPO),
      getLanguages: vi.fn().mockResolvedValue({ Go: 15000 }),
      getReadme: vi.fn().mockResolvedValue({ exists: true, size: 500 }),
      getTree: vi.fn().mockResolvedValue([
        { path: "main.go", type: "blob" },
        { path: "go.mod", type: "blob" },
      ]),
      getFileContent: vi.fn().mockResolvedValue("module example.com/app\n\ngo 1.22"),
      getCommits: vi.fn().mockResolvedValue([]),
    } as unknown as GitHubClient;

    const result = await reverifyTaskSubmission({
      taskId: "task-docker",
      skill: "Docker", // Target skill is Docker
      repositoryUrl: "https://github.com/candidate/go-microservice",
      existingEvidence: [],
      existingRepositories: [],
      client: mockClient,
    });

    // Target skill must remain Docker and must not be marked PROVEN
    expect(result.submission.skill).toBe("Docker");
    expect(result.submission.afterVerification.skill).toBe("Docker");
    expect(result.submission.afterVerification.status).toBe("CLAIMED_ONLY");
    expect(result.submission.afterVerification.evidenceScore).toBe(0);
  });

  it("PROVEN remains PROVEN when re-verified with additional work", async () => {
    const PROVEN_EVIDENCE: GitHubEvidenceItem[] = [
      DOCKERFILE_EVIDENCE,
      DOCKER_COMPOSE_EVIDENCE,
      CICD_EVIDENCE,
    ];

    const mockClient = {
      getRepository: vi.fn().mockResolvedValue(SAMPLE_REPO),
      getLanguages: vi.fn().mockResolvedValue({ Python: 5000 }),
      getReadme: vi.fn().mockResolvedValue({ exists: false }),
      getTree: vi.fn().mockResolvedValue([
        { path: "Dockerfile", type: "blob" },
      ]),
      getFileContent: vi.fn().mockResolvedValue(null),
      getCommits: vi.fn().mockResolvedValue([]),
    } as unknown as GitHubClient;

    const result = await reverifyTaskSubmission({
      taskId: "task-docker-proven",
      skill: "Docker",
      repositoryUrl: "https://github.com/candidate/docker-demo",
      existingEvidence: PROVEN_EVIDENCE,
      existingRepositories: [SAMPLE_REPO],
      client: mockClient,
    });

    expect(result.submission.beforeVerification.status).toBe("PROVEN");
    expect(result.submission.afterVerification.status).toBe("PROVEN");
    expect(result.submission.afterVerification.evidenceScore).toBeGreaterThanOrEqual(60);
  });
});

describe("Phase 10 — Error Handling & Security", () => {
  it("returns 422 when GitHub repository is not found (404)", async () => {
    // Mock reverifyTaskSubmission throwing 404 GitHubApiError
    const originalReverify = await import("@/lib/tasks/reverify");
    const spy = vi.spyOn(originalReverify, "reverifyTaskSubmission").mockRejectedValueOnce(
      new GitHubApiError(404, "Not found", "NOT_FOUND")
    );

    const req = new NextRequest("http://localhost:3000/api/tasks/submissions", {
      method: "POST",
      body: JSON.stringify({
        taskId: "task-1",
        skill: "Docker",
        repositoryUrl: "https://github.com/nonexistent/missing-repo",
      }),
    });

    const res = await submissionRoute(req);
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.code).toBe("REPO_NOT_FOUND");
    spy.mockRestore();
  });

  it("returns 429 when GitHub API rate limit is reached", async () => {
    const originalReverify = await import("@/lib/tasks/reverify");
    const spy = vi.spyOn(originalReverify, "reverifyTaskSubmission").mockRejectedValueOnce(
      new GitHubRateLimitError()
    );

    const req = new NextRequest("http://localhost:3000/api/tasks/submissions", {
      method: "POST",
      body: JSON.stringify({
        taskId: "task-1",
        skill: "Docker",
        repositoryUrl: "https://github.com/candidate/docker-demo",
      }),
    });

    const res = await submissionRoute(req);
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.code).toBe("RATE_LIMIT");
    spy.mockRestore();
  });

  it("returns 502 when GitHub API experiences a network or server failure", async () => {
    const originalReverify = await import("@/lib/tasks/reverify");
    const spy = vi.spyOn(originalReverify, "reverifyTaskSubmission").mockRejectedValueOnce(
      new GitHubApiError(500, "GitHub internal server error", "UNKNOWN")
    );

    const req = new NextRequest("http://localhost:3000/api/tasks/submissions", {
      method: "POST",
      body: JSON.stringify({
        taskId: "task-1",
        skill: "Docker",
        repositoryUrl: "https://github.com/candidate/docker-demo",
      }),
    });

    const res = await submissionRoute(req);
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.code).toBe("UNKNOWN");
    spy.mockRestore();
  });

  it("ensures GITHUB_TOKEN is never exposed in API responses or submission objects", async () => {
    const mockClient = {
      getRepository: vi.fn().mockResolvedValue(SAMPLE_REPO),
      getLanguages: vi.fn().mockResolvedValue({}),
      getReadme: vi.fn().mockResolvedValue({ exists: false }),
      getTree: vi.fn().mockResolvedValue([]),
      getFileContent: vi.fn().mockResolvedValue(null),
      getCommits: vi.fn().mockResolvedValue([]),
    } as unknown as GitHubClient;

    const result = await reverifyTaskSubmission({
      taskId: "task-sec",
      skill: "Docker",
      repositoryUrl: "https://github.com/candidate/docker-demo",
      client: mockClient,
    });

    const stringified = JSON.stringify(result);
    expect(stringified).not.toContain("ghp_");
    expect(stringified).not.toContain("github_pat_");
    expect(stringified).not.toContain("Bearer ");
  });
});
