import { describe, expect, it, vi } from "vitest";
import { GitHubClient, GitHubRateLimitError, GitHubUserNotFoundError } from "../src/lib/github/client";
import { analyzeGitHubUser } from "../src/lib/github/analyzer";
import { parsePackageJson, parsePythonRequirements } from "../src/lib/github/detectors/dependencies";
import { analyzeFileTree } from "../src/lib/github/detectors/tree-evidence";
import { POST } from "../src/app/api/github/analyze/route";
import { GET } from "../src/app/api/github/[username]/preview/route";
import { NextRequest } from "next/server";
import type { GitHubProfile, GitHubRepository, RepositoryCommit } from "../src/types/github";

const MOCK_PROFILE: GitHubProfile = {
  username: "alexsharma",
  name: "Alex Sharma",
  profileUrl: "https://github.com/alexsharma",
  avatarUrl: "https://avatars.githubusercontent.com/u/12345",
  publicRepoCount: 12,
  followers: 45,
  following: 20,
  createdAt: "2021-03-15T10:00:00Z",
  bio: "Full stack engineer building cloud systems.",
};

const MOCK_REPOSITORIES: GitHubRepository[] = [
  {
    id: 101,
    name: "ecommerce-web",
    fullName: "alexsharma/ecommerce-web",
    htmlUrl: "https://github.com/alexsharma/ecommerce-web",
    description: "Modern e-commerce platform built with React and Docker",
    isPrivate: false,
    isFork: false,
    isArchived: false,
    defaultBranch: "main",
    createdAt: "2023-01-10T10:00:00Z",
    updatedAt: "2026-09-20T12:00:00Z",
    pushedAt: "2026-09-20T12:00:00Z",
    stargazersCount: 24,
    forksCount: 5,
    language: "TypeScript",
    topics: ["react", "docker", "typescript"],
  },
  {
    id: 102,
    name: "prediction-api",
    fullName: "alexsharma/prediction-api",
    htmlUrl: "https://github.com/alexsharma/prediction-api",
    description: "FastAPI prediction microservice with AWS deployment",
    isPrivate: false,
    isFork: false,
    isArchived: false,
    defaultBranch: "main",
    createdAt: "2024-02-15T10:00:00Z",
    updatedAt: "2026-09-18T14:30:00Z",
    pushedAt: "2026-09-18T14:30:00Z",
    stargazersCount: 15,
    forksCount: 2,
    language: "Python",
    topics: ["fastapi", "python", "aws"],
  },
];

const MOCK_COMMITS: RepositoryCommit[] = [
  {
    sha: "e1f2a3b4c5d6e7f8",
    message: "feat: implement caching and Docker deployment",
    authorLogin: "alexsharma",
    date: "2026-09-20T11:45:00Z",
    url: "https://github.com/alexsharma/ecommerce-web/commit/e1f2a3b4c5d6e7f8",
  },
];

function createMockGitHubClient(overrides?: Partial<GitHubClient>): GitHubClient {
  const client = new GitHubClient();
  vi.spyOn(client, "getProfile").mockResolvedValue(MOCK_PROFILE);
  vi.spyOn(client, "getRepositories").mockResolvedValue(MOCK_REPOSITORIES);
  vi.spyOn(client, "getLanguages").mockImplementation(async (_owner, repo): Promise<Record<string, number>> => {
    if (repo === "ecommerce-web") return { TypeScript: 85000, JavaScript: 15000 };
    if (repo === "prediction-api") return { Python: 60000, Dockerfile: 2000 };
    return {};
  });
  vi.spyOn(client, "getReadme").mockResolvedValue({
    exists: true,
    htmlUrl: "https://github.com/alexsharma/ecommerce-web#readme",
    size: 2400,
    content: "# E-Commerce Web Application",
  });
  vi.spyOn(client, "getTree").mockImplementation(async (_owner, repo) => {
    if (repo === "ecommerce-web") {
      return [
        { path: "package.json", type: "blob" },
        { path: "Dockerfile", type: "blob" },
        { path: "docker-compose.yml", type: "blob" },
        { path: "k8s/deployment.yaml", type: "blob" },
        { path: ".github/workflows/ci.yml", type: "blob" },
        { path: "src/components/App.tsx", type: "blob" },
        { path: "src/__tests__/app.test.tsx", type: "blob" },
      ];
    }
    if (repo === "prediction-api") {
      return [
        { path: "requirements.txt", type: "blob" },
        { path: "Dockerfile", type: "blob" },
        { path: "tests/test_api.py", type: "blob" },
        { path: ".github/workflows/deploy.yaml", type: "blob" },
        { path: "infra/aws.tf", type: "blob" },
      ];
    }
    return [];
  });
  vi.spyOn(client, "getFileContent").mockImplementation(async (_owner, repo, path) => {
    if (repo === "ecommerce-web" && path === "package.json") {
      return JSON.stringify({
        dependencies: {
          react: "^18.2.0",
          "react-dom": "^18.2.0",
          next: "^14.0.0",
          "@aws-sdk/client-s3": "^3.0.0",
        },
        devDependencies: {
          vitest: "^1.0.0",
          typescript: "^5.0.0",
        },
      });
    }
    if (repo === "prediction-api" && path === "requirements.txt") {
      return "fastapi==0.109.0\nuvicorn==0.27.0\nboto3==1.34.0\npytest==8.0.0\nscikit-learn==1.4.0";
    }
    return null;
  });
  vi.spyOn(client, "getCommits").mockResolvedValue(MOCK_COMMITS);

  if (overrides) {
    Object.assign(client, overrides);
  }
  return client;
}

describe("GitHub Detector Unit Tests", () => {
  it("detects React, Next.js, and AWS dependencies from package.json", () => {
    const pkg = JSON.stringify({
      dependencies: {
        react: "^19.0.0",
        next: "^15.0.0",
        "@aws-sdk/client-dynamodb": "^3.0.0",
      },
      devDependencies: {
        vitest: "^3.0.0",
      },
    });
    const result = parsePackageJson(pkg);
    const names = result.map((r) => r.name);
    expect(names).toContain("react");
    expect(names).toContain("next");
    expect(names).toContain("@aws-sdk/client-dynamodb");
    expect(names).toContain("vitest");

    const hints = result.flatMap((r) => r.skillHints);
    expect(hints).toContain("React");
    expect(hints).toContain("Next.js");
    expect(hints).toContain("AWS");
    expect(hints).toContain("Testing");
  });

  it("detects Python frameworks and libraries from requirements.txt", () => {
    const reqs = "fastapi>=0.100.0\ndjango==4.2.0\nboto3\npytest\nscikit-learn";
    const result = parsePythonRequirements(reqs);
    const hints = result.flatMap((r) => r.skillHints);
    expect(hints).toContain("FastAPI");
    expect(hints).toContain("Django");
    expect(hints).toContain("AWS");
    expect(hints).toContain("Testing");
    expect(hints).toContain("Machine Learning");
  });

  it("detects Dockerfile, Docker Compose, Kubernetes, and CI/CD from file tree", () => {
    const paths = [
      "Dockerfile",
      "docker-compose.yml",
      "k8s/deployment.yaml",
      ".github/workflows/test.yml",
      "src/test/feature.test.ts",
      "infra/main.tf",
      "node_modules/bad/path.ts", // should be ignored
    ];
    const matches = analyzeFileTree(paths);

    expect(matches.some((m) => m.type === "dockerfile" && m.skillHints.includes("Docker"))).toBe(true);
    expect(matches.some((m) => m.type === "docker_compose" && m.skillHints.includes("Docker"))).toBe(true);
    expect(matches.some((m) => m.type === "kubernetes_manifest" && m.skillHints.includes("Kubernetes"))).toBe(true);
    expect(matches.some((m) => m.type === "ci_cd" && m.skillHints.includes("GitHub Actions"))).toBe(true);
    expect(matches.some((m) => m.type === "test" && m.skillHints.includes("Testing"))).toBe(true);
    // Ignored paths should not produce matches
    expect(matches.some((m) => m.filePath.includes("node_modules"))).toBe(false);
  });
});

describe("GitHub Analyzer Integration with Mocked Client", () => {
  it("extracts profile, filtered repositories, languages, and all factual evidence", async () => {
    const mockClient = createMockGitHubClient();
    const result = await analyzeGitHubUser("alexsharma", mockClient);

    // 1. Profile Extraction
    expect(result.profile.username).toBe("alexsharma");
    expect(result.profile.followers).toBe(45);
    expect(result.profile.publicRepoCount).toBe(12);

    // 2. Repository Extraction
    expect(result.repositories).toHaveLength(2);
    expect(result.summary.repositoriesAnalyzed).toBe(2);

    // 3. Language Extraction
    expect(result.summary.languagesDetected).toContain("TypeScript");
    expect(result.summary.languagesDetected).toContain("Python");
    const langEvidence = result.evidence.filter((e) => e.type === "repository_language");
    expect(langEvidence.length).toBeGreaterThan(0);

    // 4. README Detection
    const readmeEvidence = result.evidence.filter((e) => e.type === "readme");
    expect(readmeEvidence.length).toBeGreaterThan(0);
    expect(readmeEvidence[0].sourceUrl).toContain("#readme");

    // 5. Dependency & Framework Detection
    const depEvidence = result.evidence.filter((e) => e.type === "dependency");
    const depHints = depEvidence.flatMap((e) => e.skillHints);
    expect(depHints).toContain("React");
    expect(depHints).toContain("Next.js");
    expect(depHints).toContain("FastAPI");
    expect(depHints).toContain("AWS");

    // 6. Dockerfile & Kubernetes Detection
    expect(result.evidence.some((e) => e.type === "dockerfile")).toBe(true);
    expect(result.evidence.some((e) => e.type === "kubernetes_manifest")).toBe(true);

    // 7. CI/CD & Test Detection
    expect(result.evidence.some((e) => e.type === "ci_cd")).toBe(true);
    expect(result.evidence.some((e) => e.type === "test")).toBe(true);

    // 8. Commit & Recency Extraction
    const commitEvidence = result.evidence.filter((e) => e.type === "commit_recency");
    expect(commitEvidence.length).toBeGreaterThan(0);
    expect(commitEvidence[0].commitSha).toBe("e1f2a3b4c5d6e7f8");
    expect(result.summary.lastActiveDate).toBe("2026-09-20T12:00:00Z");

    // 9. Valid Source URLs
    for (const item of result.evidence) {
      expect(item.sourceUrl).toMatch(/^https:\/\/github\.com\//);
      expect(item.extractedFact).toBeTruthy();
    }
  });

  it("filters out forks and archived repositories", async () => {
    const rawRepos = [
      {
        id: 1,
        name: "active-project",
        full_name: "user/active-project",
        html_url: "https://github.com/user/active-project",
        description: null,
        private: false,
        fork: false,
        archived: false,
        default_branch: "main",
        created_at: "2024-01-01",
        updated_at: "2024-01-02",
        pushed_at: "2024-01-03",
        stargazers_count: 5,
        forks_count: 1,
        language: "Go",
      },
      {
        id: 2,
        name: "forked-project",
        full_name: "user/forked-project",
        html_url: "https://github.com/user/forked-project",
        description: null,
        private: false,
        fork: true, // fork
        archived: false,
        default_branch: "main",
        created_at: "2024-01-01",
        updated_at: "2024-01-02",
        pushed_at: "2024-01-03",
        stargazers_count: 0,
        forks_count: 0,
        language: "Go",
      },
      {
        id: 3,
        name: "archived-project",
        full_name: "user/archived-project",
        html_url: "https://github.com/user/archived-project",
        description: null,
        private: false,
        fork: false,
        archived: true, // archived
        default_branch: "main",
        created_at: "2024-01-01",
        updated_at: "2024-01-02",
        pushed_at: "2024-01-03",
        stargazers_count: 0,
        forks_count: 0,
        language: "Go",
      },
    ];

    const client = new GitHubClient();
    vi.spyOn(client as unknown as { request: () => Promise<unknown> }, "request").mockResolvedValue(rawRepos);
    const repos = await client.getRepositories("user");

    expect(repos).toHaveLength(1);
    expect(repos[0].name).toBe("active-project");
  });

  it("handles user not found error properly", async () => {
    const client = new GitHubClient();
    vi.spyOn(client as unknown as { request: () => Promise<unknown> }, "request").mockRejectedValue(
      new GitHubUserNotFoundError("unknown-user-999")
    );

    await expect(client.getProfile("unknown-user-999")).rejects.toThrow('GitHub user "unknown-user-999" was not found.');
  });

  it("handles GitHub rate limit error properly", async () => {
    const client = new GitHubClient();
    vi.spyOn(client as unknown as { request: () => Promise<unknown> }, "request").mockRejectedValue(
      new GitHubRateLimitError()
    );

    await expect(client.getProfile("any-user")).rejects.toThrow("GitHub API rate limit reached. Please try again later.");
  });
});

describe("GitHub API Route Integration Tests", () => {
  it("POST /api/github/analyze validates username and returns structured JSON with mock", async () => {
    // Test invalid username format
    const badReq = new NextRequest("http://localhost:3000/api/github/analyze", {
      method: "POST",
      body: JSON.stringify({ username: "invalid_username_with_special!@#" }),
    });
    const badRes = await POST(badReq);
    expect(badRes.status).toBe(400);
    const badData = await badRes.json();
    expect(badData.error).toContain("Invalid GitHub username format");
  });

  it("GET /api/github/[username]/preview returns 400 on invalid username", async () => {
    const req = new NextRequest("http://localhost:3000/api/github/invalid!/preview");
    const res = await GET(req, { params: Promise.resolve({ username: "invalid!username" }) });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid GitHub username format.");
  });
});
