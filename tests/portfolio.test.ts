import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { buildSkillProofPortfolio } from "@/lib/portfolio/builder";
import { POST as portfolioRoute } from "@/app/api/portfolio/route";
import type { CandidateVerificationSession } from "@/lib/evidence/session";
import type { TaskSubmission } from "@/lib/tasks/types";
import type { JobMatchEvaluation } from "@/lib/jobs/types";
import type { GitHubEvidenceItem, GitHubRepository } from "@/types";

// Mock server-only
vi.mock("server-only", () => ({}));

// -------------------------------------------------------------
// Test Fixtures
// -------------------------------------------------------------
const SAMPLE_REPO: GitHubRepository = {
  id: 101,
  name: "ecommerce-platform",
  fullName: "testuser/ecommerce-platform",
  htmlUrl: "https://github.com/testuser/ecommerce-platform",
  description: "Next.js and Docker backend",
  isPrivate: false,
  isFork: false,
  isArchived: false,
  defaultBranch: "main",
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  pushedAt: "2024-01-01T00:00:00Z",
  stargazersCount: 10,
  forksCount: 2,
  language: "TypeScript",
  topics: ["react", "docker"],
};

const REACT_EVIDENCE: GitHubEvidenceItem = {
  id: "ev-react-1",
  repositoryId: "101",
  repositoryName: "ecommerce-platform",
  type: "dependency",
  filePath: "package.json",
  skillHints: ["React"],
  sourceUrl: "https://github.com/testuser/ecommerce-platform/blob/main/package.json",
  extractedFact: "react dependency detected (npm).",
  collectedAt: "2024-01-01T00:00:00Z",
  analyzerVersion: "1.0.0",
};

const DOCKER_EVIDENCE: GitHubEvidenceItem = {
  id: "ev-docker-1",
  repositoryId: "101",
  repositoryName: "ecommerce-platform",
  type: "dockerfile",
  filePath: "Dockerfile",
  skillHints: ["Docker"],
  sourceUrl: "https://github.com/testuser/ecommerce-platform/blob/main/Dockerfile",
  extractedFact: "Dockerfile container image build definition.",
  collectedAt: "2024-01-01T00:00:00Z",
  analyzerVersion: "1.0.0",
};

const MOCK_SESSION: CandidateVerificationSession = {
  candidate: {
    name: "Alex Morgan",
    email: "alex@example.com",
  },
  githubUsername: "alexmorgan",
  analyzedAt: "2024-05-01T00:00:00Z",
  claims: [
    {
      id: "claim-1",
      canonicalSkill: "React",
      displayName: "React",
      category: "Frontend",
      sourceSection: "SKILLS",
      sourceText: "React developer",
      confidence: 1,
      status: "UNVERIFIED",
    },
    {
      id: "claim-2",
      canonicalSkill: "Docker",
      displayName: "Docker",
      category: "DevOps",
      sourceSection: "SKILLS",
      sourceText: "Docker containerization",
      confidence: 1,
      status: "UNVERIFIED",
    },
    {
      id: "claim-3",
      canonicalSkill: "Kubernetes",
      displayName: "Kubernetes",
      category: "DevOps",
      sourceSection: "SKILLS",
      sourceText: "K8s cluster orchestration",
      confidence: 1,
      status: "UNVERIFIED",
    },
  ],
  githubResult: {
    analysisRunId: "run-abc",
    profile: {
      username: "alexmorgan",
      name: "Alex Morgan",
      profileUrl: "https://github.com/alexmorgan",
      avatarUrl: "",
      publicRepoCount: 1,
      followers: 5,
      following: 5,
      createdAt: "2020-01-01T00:00:00Z",
      bio: "",
    },
    repositories: [SAMPLE_REPO],
    evidence: [REACT_EVIDENCE, DOCKER_EVIDENCE],
    summary: {
      repositoriesAnalyzed: 1,
      evidenceItems: 2,
      languagesDetected: ["TypeScript"],
      topSkillHints: ["React", "Docker"],
    },
  },
  evaluation: {
    evaluatedAt: "2024-05-01T00:00:00Z",
    summary: {
      totalClaims: 3,
      provenCount: 1,
      partialCount: 1,
      claimedOnlyCount: 1,
      averageScore: 50,
    },
    verifications: [
      {
        skill: "React",
        status: "PROVEN",
        evidenceScore: 85,
        reason: "React is supported by direct technical evidence, including package dependencies.",
        evidenceItems: [REACT_EVIDENCE],
        repositoryCount: 1,
        distinctSignalTypes: ["dependency"],
      },
      {
        skill: "Docker",
        status: "PARTIAL",
        evidenceScore: 40,
        reason: "Docker has partial supporting evidence (Dockerfile), but lacks multi-signal depth.",
        evidenceItems: [DOCKER_EVIDENCE],
        repositoryCount: 1,
        distinctSignalTypes: ["dockerfile"],
      },
      {
        skill: "Kubernetes",
        status: "CLAIMED_ONLY",
        evidenceScore: 0,
        reason: "No sufficient GitHub evidence was found to verify this resume claim.",
        evidenceItems: [],
        repositoryCount: 0,
        distinctSignalTypes: [],
      },
    ],
  },
};

const MOCK_TASK_SUBMISSION: TaskSubmission = {
  id: "sub-123",
  taskId: "task-docker-demo",
  skill: "Docker",
  repositoryUrl: "https://github.com/alexmorgan/docker-demo",
  githubOwner: "alexmorgan",
  githubRepo: "docker-demo",
  submittedAt: "2024-05-02T10:00:00Z",
  status: "VERIFICATION_UPDATED",
  beforeVerification: {
    skill: "Docker",
    status: "PARTIAL",
    evidenceScore: 40,
    reason: "Partial evidence",
    evidenceItems: [DOCKER_EVIDENCE],
    repositoryCount: 1,
    distinctSignalTypes: ["dockerfile"],
  },
  afterVerification: {
    skill: "Docker",
    status: "PROVEN",
    evidenceScore: 78,
    reason: "Upgraded to PROVEN with docker-compose and CI signals",
    evidenceItems: [
      DOCKER_EVIDENCE,
      {
        id: "ev-compose-2",
        repositoryId: "102",
        repositoryName: "docker-demo",
        type: "docker_compose",
        filePath: "docker-compose.yml",
        skillHints: ["Docker"],
        sourceUrl: "https://github.com/alexmorgan/docker-demo/blob/main/docker-compose.yml",
        extractedFact: "docker-compose.yml detected",
        collectedAt: "2024-05-02T10:00:00Z",
        analyzerVersion: "1.0.0",
      },
    ],
    repositoryCount: 2,
    distinctSignalTypes: ["dockerfile", "docker_compose"],
  },
  evidenceDiff: {
    added: [
      {
        id: "ev-compose-2",
        repositoryId: "102",
        repositoryName: "docker-demo",
        type: "docker_compose",
        filePath: "docker-compose.yml",
        skillHints: ["Docker"],
        sourceUrl: "https://github.com/alexmorgan/docker-demo/blob/main/docker-compose.yml",
        extractedFact: "docker-compose.yml detected",
        collectedAt: "2024-05-02T10:00:00Z",
        analyzerVersion: "1.0.0",
      },
    ],
    unchanged: [DOCKER_EVIDENCE],
    removed: [],
    previousScore: 40,
    newScore: 78,
    scoreDelta: 38,
    previousStatus: "PARTIAL",
    newStatus: "PROVEN",
    reasons: [
      "Verification upgraded from PARTIAL to PROVEN: newly detected technical signals increased the deterministic score to 78.",
    ],
  },
  criteriaAssessment: [
    {
      criterion: "Dockerfile build definition",
      detected: true,
      matchingFact: "Dockerfile container image build definition.",
    },
  ],
  createdAt: "2024-05-02T10:00:00Z",
  updatedAt: "2024-05-02T10:00:00Z",
};

const MOCK_JOB_MATCH: JobMatchEvaluation = {
  evaluatedAt: "2024-05-01T00:00:00Z",
  job: {
    title: "Senior DevOps Engineer",
    rawDescription: "Senior DevOps Engineer with React and Kubernetes.",
    requirements: [
      { skill: "React", normalizedSkill: "React", requirementType: "REQUIRED" },
      { skill: "Kubernetes", normalizedSkill: "Kubernetes", requirementType: "PREFERRED" },
    ],
    extractedSkills: ["React", "Kubernetes"],
    requiredSkills: ["React"],
    preferredSkills: ["Kubernetes"],
  },
  candidate: {
    name: "Alex Morgan",
    githubUsername: "alexmorgan",
    isSample: false,
  },
  metrics: {
    totalRequirements: 2,
    overallCoverage: 50,
    requiredCoverage: 100,
    preferredCoverage: 0,
    requiredCounts: {
      total: 1,
      verified: 1,
      partial: 0,
      notVerified: 0,
    },
    preferredCounts: {
      total: 1,
      verified: 0,
      partial: 0,
      notVerified: 1,
    },
  },
  matches: [
    {
      skill: "React",
      requirementType: "REQUIRED",
      matchStatus: "VERIFIED_MATCH",
      candidateStatus: "PROVEN",
      verificationScore: 85,
      repositoryCount: 1,
      supportingEvidence: [REACT_EVIDENCE],
      explanation: "Fully verified",
      sourceText: "React required",
    },
    {
      skill: "Kubernetes",
      requirementType: "PREFERRED",
      matchStatus: "NOT_VERIFIED",
      candidateStatus: "CLAIMED_ONLY",
      verificationScore: 0,
      repositoryCount: 0,
      supportingEvidence: [],
      explanation: "Insufficient evidence for Kubernetes",
      sourceText: "K8s preferred",
    },
  ],
};

// -------------------------------------------------------------
// Test Suite
// -------------------------------------------------------------
describe("Phase 11 — Portfolio Aggregation & Proof Matrix", () => {
  it("aggregates candidate verification session deterministically", () => {
    const portfolio = buildSkillProofPortfolio(MOCK_SESSION, [MOCK_TASK_SUBMISSION], MOCK_JOB_MATCH);

    expect(portfolio.candidate.name).toBe("Alex Morgan");
    expect(portfolio.candidate.githubUsername).toBe("alexmorgan");
    expect(portfolio.candidate.email).toBe("alex@example.com");
    expect(portfolio.summary.claimedSkillsCount).toBe(3);
    expect(portfolio.summary.provenCount).toBe(1);
    expect(portfolio.summary.partialCount).toBe(1);
    expect(portfolio.summary.insufficientCount).toBe(1);
    expect(portfolio.summary.repositoryCount).toBe(1);
    expect(portfolio.summary.evidenceCount).toBe(2);
  });

  it("calculates exact average score without inventing new weighting rules", () => {
    const portfolio = buildSkillProofPortfolio(MOCK_SESSION);
    // (85 + 40 + 0) / 3 = 125 / 3 = 42
    expect(portfolio.summary.averageScore).toBe(42);
  });

  it("accurately maps skill items and distinct signals", () => {
    const portfolio = buildSkillProofPortfolio(MOCK_SESSION);
    const react = portfolio.skills.find((s) => s.skill === "React");
    expect(react).toBeDefined();
    expect(react?.status).toBe("PROVEN");
    expect(react?.evidenceScore).toBe(85);
    expect(react?.evidenceCount).toBe(1);
    expect(react?.repositoryCount).toBe(1);
    expect(react?.distinctSignalTypes).toContain("dependency");
  });

  it("handles null session cleanly with safe neutral fallback", () => {
    const portfolio = buildSkillProofPortfolio(null);
    expect(portfolio.candidate.name).toBe("SkillProof Candidate");
    expect(portfolio.candidate.githubUsername).toBeUndefined();
    expect(portfolio.summary.claimedSkillsCount).toBe(0);
    expect(portfolio.skills).toHaveLength(0);
    expect(portfolio.repositories).toHaveLength(0);
    expect(portfolio.verificationHistory).toHaveLength(0);
    expect(portfolio.tasks).toHaveLength(0);
  });
});

describe("Phase 11 — Verification History & Proof Transitions", () => {
  it("maps Phase 10 task submissions into verification history timeline", () => {
    const portfolio = buildSkillProofPortfolio(MOCK_SESSION, [MOCK_TASK_SUBMISSION]);

    expect(portfolio.verificationHistory).toHaveLength(1);
    const historyItem = portfolio.verificationHistory[0];
    expect(historyItem.skill).toBe("Docker");
    expect(historyItem.previousStatus).toBe("PARTIAL");
    expect(historyItem.newStatus).toBe("PROVEN");
    expect(historyItem.previousScore).toBe(40);
    expect(historyItem.newScore).toBe(78);
    expect(historyItem.scoreDelta).toBe(38);
    expect(historyItem.newEvidence).toHaveLength(1);
    expect(historyItem.repositoryUrl).toBe("https://github.com/alexmorgan/docker-demo");
  });

  it("links timeline entries to corresponding skill portfolio items", () => {
    const portfolio = buildSkillProofPortfolio(MOCK_SESSION, [MOCK_TASK_SUBMISSION]);
    const dockerSkill = portfolio.skills.find((s) => s.skill === "Docker");

    expect(dockerSkill?.hasBeforeAfterHistory).toBe(true);
    expect(dockerSkill?.timeline).toHaveLength(1);
    expect(dockerSkill?.timeline[0].newStatus).toBe("PROVEN");
  });

  it("does not fabricate verification history when no task submissions exist", () => {
    const portfolio = buildSkillProofPortfolio(MOCK_SESSION, []);
    expect(portfolio.verificationHistory).toHaveLength(0);
    for (const skill of portfolio.skills) {
      expect(skill.hasBeforeAfterHistory).toBe(false);
      expect(skill.timeline).toHaveLength(0);
    }
  });

  it("maps task completion items accurately", () => {
    const portfolio = buildSkillProofPortfolio(MOCK_SESSION, [MOCK_TASK_SUBMISSION]);
    expect(portfolio.tasks).toHaveLength(1);
    const task = portfolio.tasks[0];
    expect(task.skill).toBe("Docker");
    expect(task.status).toBe("VERIFICATION_UPDATED");
    expect(task.scoreDelta).toBe(38);
    expect(task.criteriaAssessment).toHaveLength(1);
    expect(task.criteriaAssessment[0].detected).toBe(true);
  });
});

describe("Phase 11 — Remaining Skill Gaps & Job Match Context", () => {
  it("integrates Phase 8 skill gaps from JobMatchEvaluation", () => {
    const portfolio = buildSkillProofPortfolio(MOCK_SESSION, [], MOCK_JOB_MATCH);
    expect(portfolio.skillGaps).toHaveLength(1);
    const gap = portfolio.skillGaps[0];
    expect(gap.skill).toBe("Kubernetes");
    expect(gap.gapType).toBe("EVIDENCE_GAP");
    expect(gap.priority).toBe("LOW"); // Preferred evidence gap = LOW
  });

  it("handles empty or missing job match evaluation gracefully", () => {
    const portfolio = buildSkillProofPortfolio(MOCK_SESSION, [], null);
    expect(portfolio.jobMatch).toBeNull();
    expect(portfolio.skillGaps).toHaveLength(0);
  });
});

describe("Phase 11 — API Route POST /api/portfolio", () => {
  it("returns portfolio aggregation from request body payload", async () => {
    const req = new NextRequest("http://localhost:3000/api/portfolio", {
      method: "POST",
      body: JSON.stringify({
        session: MOCK_SESSION,
        taskSubmissions: [MOCK_TASK_SUBMISSION],
        jobMatch: MOCK_JOB_MATCH,
      }),
    });

    const res = await portfolioRoute(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.portfolio).toBeDefined();
    expect(data.portfolio.candidate.name).toBe("Alex Morgan");
    expect(data.portfolio.summary.claimedSkillsCount).toBe(3);
    expect(data.portfolio.verificationHistory).toHaveLength(1);
  });

  it("handles empty POST payload with 200 and clean fallback defaults", async () => {
    const req = new NextRequest("http://localhost:3000/api/portfolio", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await portfolioRoute(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.portfolio.candidate.name).toBe("SkillProof Candidate");
  });
});

describe("Phase 11 — Security & Privacy Constraints", () => {
  it("never includes GITHUB_TOKEN or API secrets in portfolio serialization", () => {
    const portfolio = buildSkillProofPortfolio(MOCK_SESSION, [MOCK_TASK_SUBMISSION]);
    const raw = JSON.stringify(portfolio);

    expect(raw).not.toContain("ghp_");
    expect(raw).not.toContain("github_pat_");
    expect(raw).not.toContain("Bearer ");
    expect(raw).not.toContain("AIzaSy"); // Gemini API key prefix
  });

  it("preserves real GitHub source URLs for judge auditability", () => {
    const portfolio = buildSkillProofPortfolio(MOCK_SESSION);
    const react = portfolio.skills.find((s) => s.skill === "React");
    expect(react?.evidenceItems[0].sourceUrl).toBe(
      "https://github.com/testuser/ecommerce-platform/blob/main/package.json"
    );
  });

  it("does not calculate hiring scores or candidate rankings", () => {
    const portfolio = buildSkillProofPortfolio(MOCK_SESSION);
    const keys = Object.keys(portfolio.summary);

    expect(keys).not.toContain("hiringScore");
    expect(keys).not.toContain("employabilityScore");
    expect(keys).not.toContain("talentRank");
    expect(keys).not.toContain("candidateScore");
  });
});
