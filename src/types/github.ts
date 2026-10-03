export interface GitHubProfile {
  username: string;
  name: string | null;
  profileUrl: string;
  avatarUrl: string;
  publicRepoCount: number;
  followers: number;
  following: number;
  createdAt: string;
  bio: string | null;
}

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  stargazersCount: number;
  forksCount: number;
  language: string | null;
  topics: string[];
}

export interface RepositoryLanguage {
  name: string;
  bytes: number;
  percentage: number;
}

export interface RepositoryFile {
  path: string;
  type: "file" | "dir";
  size?: number;
  url: string;
}

export interface RepositoryDependency {
  name: string;
  version?: string;
  ecosystem: "npm" | "pip" | "maven" | "go" | "cargo" | "other";
  sourceUrl: string;
}

export interface RepositoryCommit {
  sha: string;
  message: string;
  authorLogin?: string;
  date: string;
  url: string;
}

export type GitHubEvidenceType =
  | "repository_language"
  | "readme"
  | "package_manifest"
  | "dependency"
  | "framework"
  | "dockerfile"
  | "docker_compose"
  | "kubernetes_manifest"
  | "cloud_configuration"
  | "ci_cd"
  | "test"
  | "commit_recency";

import type { BehanceEvidenceType, EvidenceProvider } from "./behance";

/**
 * Unified evidence type across all providers.
 * GitHub types are the original set; Behance types extend the union.
 */
export type UnifiedEvidenceType = GitHubEvidenceType | BehanceEvidenceType;

export interface GitHubEvidenceItem {
  id: string;
  candidateId?: string;
  repositoryId?: string;
  repositoryName?: string;
  type: UnifiedEvidenceType;
  skillHints: string[];
  filePath?: string;
  commitSha?: string;
  sourceUrl: string;
  extractedFact: string;
  collectedAt: string;
  analyzerVersion: string;
  /** Evidence provider — defaults to "github" when absent for backward compatibility */
  provider?: EvidenceProvider;
  /** Provider-specific metadata (e.g. Behance projectId, media info) */
  metadata?: Record<string, unknown>;
}

export type AnalysisRunStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export interface AnalysisRun {
  analysisRunId: string;
  startedAt: string;
  completedAt?: string;
  username: string;
  repositoryCount: number;
  status: AnalysisRunStatus;
  analyzerVersion: string;
  error?: string;
}

export interface GitHubAnalysisResult {
  analysisRunId: string;
  profile: GitHubProfile;
  repositories: GitHubRepository[];
  evidence: GitHubEvidenceItem[];
  summary: {
    repositoriesAnalyzed: number;
    evidenceItems: number;
    languagesDetected: string[];
    topSkillHints: string[];
    lastActiveDate?: string;
  };
}
