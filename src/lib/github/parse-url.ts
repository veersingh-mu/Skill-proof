/**
 * Utility for safely parsing and validating GitHub repository URLs.
 * Rejects non-GitHub domains, invalid repository paths, and malformed inputs.
 */

export class GitHubUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHubUrlError";
  }
}

export interface ParsedGitHubRepo {
  owner: string;
  repo: string;
  normalizedUrl: string;
}

// Allowed characters in GitHub usernames and repo names:
// Usernames: alphanumeric or single hyphens, cannot begin/end with hyphen.
// Repos: alphanumeric, hyphens, underscores, dots.
const GITHUB_OWNER_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
const GITHUB_REPO_REGEX = /^[a-zA-Z0-9._-]+$/;

/**
 * Validates and parses a GitHub repository URL.
 * Accepts:
 *   - https://github.com/owner/repo
 *   - http://github.com/owner/repo
 *   - github.com/owner/repo
 *   - with trailing slash or .git
 */
export function parseGitHubRepoUrl(rawUrl: string): ParsedGitHubRepo {
  if (!rawUrl || typeof rawUrl !== "string") {
    throw new GitHubUrlError("Repository URL is required.");
  }

  const trimmed = rawUrl.trim();
  if (trimmed.length === 0) {
    throw new GitHubUrlError("Repository URL cannot be empty.");
  }

  // Ensure protocol for URL parsing if omitted
  let candidate = trimmed;
  if (!candidate.startsWith("http://") && !candidate.startsWith("https://")) {
    candidate = `https://${candidate}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new GitHubUrlError("Invalid URL format.");
  }

  const host = parsed.hostname.toLowerCase();
  if (host !== "github.com" && host !== "www.github.com") {
    throw new GitHubUrlError("Only public GitHub repositories (github.com) are supported.");
  }

  if (parsed.search && parsed.search.length > 0) {
    throw new GitHubUrlError("Repository URL must not contain query parameters.");
  }

  if (parsed.hash && parsed.hash.length > 0) {
    throw new GitHubUrlError("Repository URL must not contain hash fragments.");
  }

  // Pathname should be /owner/repo (ignoring trailing slash)
  const segments = parsed.pathname
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);

  if (segments.length < 2) {
    throw new GitHubUrlError("GitHub repository URL must include both owner and repository name (e.g. github.com/owner/repo).");
  }

  const owner = segments[0];
  let repo = segments[1];

  // Strip .git suffix if present
  if (repo.endsWith(".git")) {
    repo = repo.slice(0, -4);
  }

  if (!GITHUB_OWNER_REGEX.test(owner)) {
    throw new GitHubUrlError(`Invalid GitHub owner/organization name: "${owner}".`);
  }

  if (!GITHUB_REPO_REGEX.test(repo) || repo === "." || repo === "..") {
    throw new GitHubUrlError(`Invalid GitHub repository name: "${repo}".`);
  }

  const normalizedUrl = `https://github.com/${owner}/${repo}`;

  return {
    owner,
    repo,
    normalizedUrl,
  };
}
