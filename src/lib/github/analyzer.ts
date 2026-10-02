import "server-only";
import { GITHUB_CONFIG } from "./config";
import { GitHubClient } from "./client";
import {
  parseCargoToml,
  parseGoMod,
  parsePackageJson,
  parsePythonRequirements,
} from "./detectors/dependencies";
import { analyzeFileTree } from "./detectors/tree-evidence";
import type {
  GitHubAnalysisResult,
  GitHubEvidenceItem,
  GitHubProfile,
  GitHubRepository,
} from "@/types/github";

export async function analyzeRepositoryEvidence(
  repo: GitHubRepository,
  client = new GitHubClient(),
  candidateId?: string
): Promise<{
  evidence: GitHubEvidenceItem[];
  languages: string[];
  skillHints: string[];
}> {
  const collectedAt = new Date().toISOString();
  const owner = repo.fullName.split("/")[0] || repo.name;
  const repoId = String(repo.id);
  const repoName = repo.name;
  const evidence: GitHubEvidenceItem[] = [];
  const languagesSet = new Set<string>();
  const skillHintsSet = new Set<string>();

  // A. Languages
  const languages = await client.getLanguages(owner, repoName);
  const totalBytes = Object.values(languages).reduce((acc, bytes) => acc + bytes, 0);

  for (const [lang, bytes] of Object.entries(languages)) {
    languagesSet.add(lang);
    const percentage = totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0;

    // Only generate evidence for meaningful languages (>= 5% of code or > 1000 bytes)
    if (percentage >= 5 || bytes > 1000) {
      skillHintsSet.add(lang);
      evidence.push({
        id: crypto.randomUUID(),
        candidateId,
        repositoryId: repoId,
        repositoryName: repoName,
        type: "repository_language",
        skillHints: [lang],
        sourceUrl: repo.htmlUrl,
        extractedFact: `${lang} detected as repository language (${percentage}% of codebase, ${bytes.toLocaleString()} bytes).`,
        collectedAt,
        analyzerVersion: GITHUB_CONFIG.ANALYZER_VERSION,
      });
    }
  }

  // B. README
  const readme = await client.getReadme(owner, repoName);
  if (readme.exists) {
    evidence.push({
      id: crypto.randomUUID(),
      candidateId,
      repositoryId: repoId,
      repositoryName: repoName,
      type: "readme",
      filePath: "README.md",
      skillHints: ["Documentation"],
      sourceUrl: readme.htmlUrl,
      extractedFact: `Project documentation detected (${readme.size} bytes).`,
      collectedAt,
      analyzerVersion: GITHUB_CONFIG.ANALYZER_VERSION,
    });
  }

  // C. File Tree Inspection
  const tree = await client.getTree(owner, repoName, repo.defaultBranch);
  const filePaths = tree.map((t) => t.path);

  const treeMatches = analyzeFileTree(filePaths);
  for (const match of treeMatches) {
    for (const hint of match.skillHints) skillHintsSet.add(hint);
    evidence.push({
      id: crypto.randomUUID(),
      candidateId,
      repositoryId: repoId,
      repositoryName: repoName,
      type: match.type,
      filePath: match.filePath,
      skillHints: match.skillHints,
      sourceUrl: `https://github.com/${owner}/${repoName}/blob/${repo.defaultBranch}/${match.filePath}`,
      extractedFact: match.extractedFact,
      collectedAt,
      analyzerVersion: GITHUB_CONFIG.ANALYZER_VERSION,
    });
  }

  // D. Manifest & Dependency Inspection
  // JavaScript / TypeScript: package.json
  if (filePaths.includes("package.json")) {
    const content = await client.getFileContent(owner, repoName, "package.json");
    if (content) {
      const detected = parsePackageJson(content);
      for (const dep of detected) {
        for (const hint of dep.skillHints) skillHintsSet.add(hint);
        evidence.push({
          id: crypto.randomUUID(),
          candidateId,
          repositoryId: repoId,
          repositoryName: repoName,
          type: "dependency",
          filePath: "package.json",
          skillHints: dep.skillHints,
          sourceUrl: `https://github.com/${owner}/${repoName}/blob/${repo.defaultBranch}/package.json`,
          extractedFact: `${dep.name} dependency detected (${dep.ecosystem}).`,
          collectedAt,
          analyzerVersion: GITHUB_CONFIG.ANALYZER_VERSION,
        });
      }
    }
  }

  // Python: requirements.txt
  if (filePaths.includes("requirements.txt")) {
    const content = await client.getFileContent(owner, repoName, "requirements.txt");
    if (content) {
      const detected = parsePythonRequirements(content);
      for (const dep of detected) {
        for (const hint of dep.skillHints) skillHintsSet.add(hint);
        evidence.push({
          id: crypto.randomUUID(),
          candidateId,
          repositoryId: repoId,
          repositoryName: repoName,
          type: "dependency",
          filePath: "requirements.txt",
          skillHints: dep.skillHints,
          sourceUrl: `https://github.com/${owner}/${repoName}/blob/${repo.defaultBranch}/requirements.txt`,
          extractedFact: `${dep.name} Python dependency detected.`,
          collectedAt,
          analyzerVersion: GITHUB_CONFIG.ANALYZER_VERSION,
        });
      }
    }
  }

  // Go: go.mod
  if (filePaths.includes("go.mod")) {
    const content = await client.getFileContent(owner, repoName, "go.mod");
    if (content) {
      const detected = parseGoMod(content);
      for (const dep of detected) {
        for (const hint of dep.skillHints) skillHintsSet.add(hint);
        evidence.push({
          id: crypto.randomUUID(),
          candidateId,
          repositoryId: repoId,
          repositoryName: repoName,
          type: "dependency",
          filePath: "go.mod",
          skillHints: dep.skillHints,
          sourceUrl: `https://github.com/${owner}/${repoName}/blob/${repo.defaultBranch}/go.mod`,
          extractedFact: `${dep.name} Go dependency detected.`,
          collectedAt,
          analyzerVersion: GITHUB_CONFIG.ANALYZER_VERSION,
        });
      }
    }
  }

  // Rust: Cargo.toml
  if (filePaths.includes("Cargo.toml")) {
    const content = await client.getFileContent(owner, repoName, "Cargo.toml");
    if (content) {
      const detected = parseCargoToml(content);
      for (const dep of detected) {
        for (const hint of dep.skillHints) skillHintsSet.add(hint);
        evidence.push({
          id: crypto.randomUUID(),
          candidateId,
          repositoryId: repoId,
          repositoryName: repoName,
          type: "dependency",
          filePath: "Cargo.toml",
          skillHints: dep.skillHints,
          sourceUrl: `https://github.com/${owner}/${repoName}/blob/${repo.defaultBranch}/Cargo.toml`,
          extractedFact: `${dep.name} Rust dependency detected.`,
          collectedAt,
          analyzerVersion: GITHUB_CONFIG.ANALYZER_VERSION,
        });
      }
    }
  }

  // E. Commits & Recency
  const commits = await client.getCommits(owner, repoName, GITHUB_CONFIG.MAX_COMMITS_PER_REPOSITORY);
  if (commits.length > 0) {
    const recent = commits[0];
    const commitDate = recent.date.slice(0, 10);
    evidence.push({
      id: crypto.randomUUID(),
      candidateId,
      repositoryId: repoId,
      repositoryName: repoName,
      type: "commit_recency",
      commitSha: recent.sha,
      skillHints: ["Git"],
      sourceUrl: recent.url,
      extractedFact: `Recent commit recorded on ${commitDate}: "${recent.message}".`,
      collectedAt,
      analyzerVersion: GITHUB_CONFIG.ANALYZER_VERSION,
    });
  }

  return {
    evidence,
    languages: Array.from(languagesSet),
    skillHints: Array.from(skillHintsSet),
  };
}

export async function analyzeGitHubUser(
  username: string,
  client = new GitHubClient(),
  candidateId?: string
): Promise<GitHubAnalysisResult> {
  const analysisRunId = crypto.randomUUID();

  // 1. Fetch Profile
  const profile: GitHubProfile = await client.getProfile(username);

  // 2. Fetch Public Repositories (sorted by pushed_at desc, non-fork, non-archived)
  const allRepos = await client.getRepositories(username);
  const repositories: GitHubRepository[] = allRepos.slice(0, GITHUB_CONFIG.MAX_REPOSITORIES);

  const evidence: GitHubEvidenceItem[] = [];
  const languagesSet = new Set<string>();
  const skillHintsSet = new Set<string>();
  let latestActivityDate: string | undefined = undefined;

  // 3. Inspect each prioritized repository
  for (const repo of repositories) {
    if (repo.pushedAt) {
      if (!latestActivityDate || new Date(repo.pushedAt) > new Date(latestActivityDate)) {
        latestActivityDate = repo.pushedAt;
      }
    }

    const repoResult = await analyzeRepositoryEvidence(repo, client, candidateId);
    for (const item of repoResult.evidence) evidence.push(item);
    for (const lang of repoResult.languages) languagesSet.add(lang);
    for (const hint of repoResult.skillHints) skillHintsSet.add(hint);
  }

  return {
    analysisRunId,
    profile,
    repositories,
    evidence,
    summary: {
      repositoriesAnalyzed: repositories.length,
      evidenceItems: evidence.length,
      languagesDetected: [...languagesSet],
      topSkillHints: [...skillHintsSet].slice(0, 10),
      lastActiveDate: latestActivityDate,
    },
  };
}
