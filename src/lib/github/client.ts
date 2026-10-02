import "server-only";
import { GITHUB_CONFIG } from "./config";
import type {
  GitHubProfile,
  GitHubRepository,
  RepositoryCommit,
} from "@/types/github";

export class GitHubApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: "RATE_LIMIT" | "NOT_FOUND" | "CONFIG_ERROR" | "NETWORK_ERROR" | "UNKNOWN"
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

export class GitHubRateLimitError extends GitHubApiError {
  constructor(message = "GitHub API rate limit reached. Please try again later.") {
    super(403, message, "RATE_LIMIT");
    this.name = "GitHubRateLimitError";
  }
}

export class GitHubUserNotFoundError extends GitHubApiError {
  constructor(username: string) {
    super(404, `GitHub user "${username}" was not found.`, "NOT_FOUND");
    this.name = "GitHubUserNotFoundError";
  }
}

export class GitHubClient {
  private readonly token?: string;
  private readonly baseUrl = "https://api.github.com";

  constructor(token?: string) {
    this.token = token ?? process.env.GITHUB_TOKEN;
  }

  private get headers(): HeadersInit {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": GITHUB_CONFIG.USER_AGENT,
    };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint}`;
    let response: Response;

    try {
      response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...(options?.headers ?? {}),
        },
        signal: AbortSignal.timeout(GITHUB_CONFIG.REQUEST_TIMEOUT_MS),
      });
    } catch (caught) {
      throw new GitHubApiError(
        0,
        caught instanceof Error ? caught.message : "Unable to reach GitHub API.",
        "NETWORK_ERROR"
      );
    }

    if (response.status === 404) {
      throw new GitHubApiError(404, "Requested resource not found on GitHub.", "NOT_FOUND");
    }

    if (response.status === 403 || response.status === 429) {
      const remaining = response.headers.get("x-ratelimit-remaining");
      if (remaining === "0" || response.status === 429) {
        throw new GitHubRateLimitError();
      }
      throw new GitHubRateLimitError("GitHub API request was restricted. Please verify your credentials or try again later.");
    }

    if (!response.ok) {
      throw new GitHubApiError(
        response.status,
        `GitHub API returned status ${response.status}.`,
        "UNKNOWN"
      );
    }

    return (await response.json()) as T;
  }

  async getProfile(username: string): Promise<GitHubProfile> {
    try {
      const data = await this.request<{
        login: string;
        name: string | null;
        html_url: string;
        avatar_url: string;
        public_repos: number;
        followers: number;
        following: number;
        created_at: string;
        bio: string | null;
      }>(`/users/${encodeURIComponent(username)}`);

      return {
        username: data.login,
        name: data.name,
        profileUrl: data.html_url,
        avatarUrl: data.avatar_url,
        publicRepoCount: data.public_repos,
        followers: data.followers,
        following: data.following,
        createdAt: data.created_at,
        bio: data.bio,
      };
    } catch (error) {
      if (error instanceof GitHubApiError && error.statusCode === 404) {
        throw new GitHubUserNotFoundError(username);
      }
      throw error;
    }
  }

  async getRepositories(username: string): Promise<GitHubRepository[]> {
    const rawRepos = await this.request<
      Array<{
        id: number;
        name: string;
        full_name: string;
        html_url: string;
        description: string | null;
        private: boolean;
        fork: boolean;
        archived: boolean;
        default_branch: string;
        created_at: string;
        updated_at: string;
        pushed_at: string;
        stargazers_count: number;
        forks_count: number;
        language: string | null;
        topics?: string[];
      }>
    >(`/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed&direction=desc`);

    return rawRepos
      .filter((repo) => !repo.private && !repo.archived && !repo.fork)
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        htmlUrl: repo.html_url,
        description: repo.description,
        isPrivate: repo.private,
        isFork: repo.fork,
        isArchived: repo.archived,
        defaultBranch: repo.default_branch || "main",
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        pushedAt: repo.pushed_at,
        stargazersCount: repo.stargazers_count,
        forksCount: repo.forks_count,
        language: repo.language,
        topics: repo.topics ?? [],
      }));
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const raw = await this.request<{
      id: number;
      name: string;
      full_name: string;
      html_url: string;
      description: string | null;
      private: boolean;
      fork: boolean;
      archived: boolean;
      default_branch: string;
      created_at: string;
      updated_at: string;
      pushed_at: string;
      stargazers_count: number;
      forks_count: number;
      language: string | null;
      topics?: string[];
    }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);

    return {
      id: raw.id,
      name: raw.name,
      fullName: raw.full_name,
      htmlUrl: raw.html_url,
      description: raw.description,
      isPrivate: raw.private,
      isFork: raw.fork,
      isArchived: raw.archived,
      defaultBranch: raw.default_branch || "main",
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
      pushedAt: raw.pushed_at,
      stargazersCount: raw.stargazers_count,
      forksCount: raw.forks_count,
      language: raw.language,
      topics: raw.topics ?? [],
    };
  }

  async getLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    try {
      return await this.request<Record<string, number>>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`);
    } catch {
      return {};
    }
  }

  async getReadme(
    owner: string,
    repo: string
  ): Promise<{ exists: boolean; htmlUrl: string; size: number; content?: string }> {
    try {
      const data = await this.request<{
        name: string;
        html_url: string;
        size: number;
        content?: string;
        encoding?: string;
      }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`);

      let decodedContent: string | undefined;
      if (data.content && data.encoding === "base64") {
        try {
          const raw = Buffer.from(data.content, "base64").toString("utf-8");
          decodedContent = raw.slice(0, GITHUB_CONFIG.MAX_README_BYTES);
        } catch {
          decodedContent = undefined;
        }
      }

      return {
        exists: true,
        htmlUrl: data.html_url,
        size: data.size,
        content: decodedContent,
      };
    } catch {
      return {
        exists: false,
        htmlUrl: `https://github.com/${owner}/${repo}#readme`,
        size: 0,
      };
    }
  }

  async getTree(
    owner: string,
    repo: string,
    defaultBranch: string
  ): Promise<Array<{ path: string; type: "blob" | "tree"; size?: number }>> {
    try {
      const data = await this.request<{
        tree: Array<{ path: string; type: "blob" | "tree"; size?: number }>;
        truncated: boolean;
      }>(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`
      );
      return data.tree || [];
    } catch {
      return [];
    }
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    try {
      const data = await this.request<{
        content?: string;
        encoding?: string;
      }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}`);

      if (data.content && data.encoding === "base64") {
        return Buffer.from(data.content, "base64").toString("utf-8");
      }
      return null;
    } catch {
      return null;
    }
  }

  async getCommits(owner: string, repo: string, limit = GITHUB_CONFIG.MAX_COMMITS_PER_REPOSITORY): Promise<RepositoryCommit[]> {
    try {
      const rawCommits = await this.request<
        Array<{
          sha: string;
          html_url: string;
          commit: {
            message: string;
            author: { name: string; date: string } | null;
            committer: { name: string; date: string } | null;
          };
          author: { login: string } | null;
        }>
      >(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=${limit}`);

      return rawCommits.map((item) => ({
        sha: item.sha,
        message: item.commit.message.split("\n")[0].slice(0, 140),
        authorLogin: item.author?.login,
        date: item.commit.author?.date || item.commit.committer?.date || new Date().toISOString(),
        url: item.html_url,
      }));
    } catch {
      return [];
    }
  }
}
