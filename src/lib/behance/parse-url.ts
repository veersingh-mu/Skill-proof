/**
 * Behance URL parsing and validation utilities.
 * Follows the same pattern as github/parse-url.ts.
 */

import { BEHANCE_CONFIG } from "./config";

export class BehanceUrlError extends Error {
  constructor(
    message: string,
    public readonly code: "INVALID_BEHANCE_URL" = "INVALID_BEHANCE_URL"
  ) {
    super(message);
    this.name = "BehanceUrlError";
  }
}

export interface ParsedBehanceProfile {
  username: string;
  normalizedUrl: string;
}

export interface ParsedBehanceProject {
  projectId: string;
  slug: string;
  normalizedUrl: string;
}

/**
 * Validates and normalizes a Behance profile URL.
 *
 * Accepts:
 *   - https://www.behance.net/username
 *   - http://www.behance.net/username
 *   - https://behance.net/username
 *   - with or without trailing slash
 *
 * Rejects:
 *   - Non-Behance domains (SSRF protection)
 *   - URLs with query parameters or hash fragments
 *   - Reserved Behance paths (gallery, search, etc.)
 */
export function parseBehanceProfileUrl(rawUrl: string): ParsedBehanceProfile {
  if (!rawUrl || typeof rawUrl !== "string") {
    throw new BehanceUrlError("Behance profile URL is required.");
  }

  const trimmed = rawUrl.trim();
  if (trimmed.length === 0) {
    throw new BehanceUrlError("Behance profile URL cannot be empty.");
  }

  if (trimmed.length > 300) {
    throw new BehanceUrlError("Behance URL is too long.");
  }

  // Ensure protocol for URL parsing; allow bare username or @username
  let candidate = trimmed.replace(/^@/, "");
  if (!candidate.includes("/") && !candidate.includes(".")) {
    candidate = `https://www.behance.net/${candidate}`;
  } else if (!candidate.startsWith("http://") && !candidate.startsWith("https://")) {
    candidate = `https://${candidate}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new BehanceUrlError("Invalid URL format.");
  }

  // SSRF protection: domain allowlist
  const host = parsed.hostname.toLowerCase();
  if (!BEHANCE_CONFIG.ALLOWED_DOMAINS.includes(host)) {
    throw new BehanceUrlError(
      "Only Behance profile URLs (behance.net) are supported."
    );
  }

  // Reject non-HTTPS in production
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new BehanceUrlError("Only HTTP/HTTPS protocols are supported.");
  }

  if (parsed.search && parsed.search.length > 0) {
    throw new BehanceUrlError("Behance URL must not contain query parameters.");
  }

  if (parsed.hash && parsed.hash.length > 0) {
    throw new BehanceUrlError("Behance URL must not contain hash fragments.");
  }

  const segments = parsed.pathname
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    throw new BehanceUrlError(
      "Behance URL must include a username (e.g. behance.net/username)."
    );
  }

  // Detect gallery/project URLs — guide user to profile URL
  if (segments[0] === "gallery") {
    throw new BehanceUrlError(
      "Please enter a Behance profile URL (e.g. https://www.behance.net/username), not a project URL."
    );
  }

  // Reject reserved Behance paths
  const RESERVED_PATHS = [
    "search", "galleries", "featured", "curated", "moodboards",
    "assets", "onboarding", "pro", "adobe", "signin", "signup",
    "privacy", "terms", "help", "about",
  ];

  if (RESERVED_PATHS.includes(segments[0].toLowerCase())) {
    throw new BehanceUrlError(
      `"${segments[0]}" is not a valid Behance username. Please enter a profile URL.`
    );
  }

  const username = segments[0];

  // Validate username format (alphanumeric, hyphens, underscores, dots)
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(username)) {
    throw new BehanceUrlError(`Invalid Behance username: "${username}".`);
  }

  if (username.length > 100) {
    throw new BehanceUrlError("Behance username is too long.");
  }

  return {
    username,
    normalizedUrl: `https://www.behance.net/${username}`,
  };
}

/**
 * Validates and parses a Behance gallery/project URL.
 *
 * Accepts:
 *   - https://www.behance.net/gallery/PROJECT_ID/PROJECT_SLUG
 */
export function parseBehanceProjectUrl(rawUrl: string): ParsedBehanceProject {
  if (!rawUrl || typeof rawUrl !== "string") {
    throw new BehanceUrlError("Behance project URL is required.");
  }

  let candidate = rawUrl.trim();
  if (!candidate.startsWith("http://") && !candidate.startsWith("https://")) {
    candidate = `https://${candidate}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new BehanceUrlError("Invalid URL format.");
  }

  const host = parsed.hostname.toLowerCase();
  if (!BEHANCE_CONFIG.ALLOWED_DOMAINS.includes(host)) {
    throw new BehanceUrlError(
      "Only Behance URLs (behance.net) are supported."
    );
  }

  const segments = parsed.pathname.split("/").filter(Boolean);

  if (segments.length < 3 || segments[0] !== "gallery") {
    throw new BehanceUrlError(
      "Invalid Behance project URL format. Expected: https://www.behance.net/gallery/PROJECT_ID/SLUG"
    );
  }

  const projectId = segments[1];
  const slug = segments[2];

  if (!/^\d+$/.test(projectId)) {
    throw new BehanceUrlError(`Invalid Behance project ID: "${projectId}".`);
  }

  return {
    projectId,
    slug,
    normalizedUrl: `https://www.behance.net/gallery/${projectId}/${slug}`,
  };
}

/**
 * Checks if a URL is a Behance profile URL (vs project URL).
 */
export function isBehanceProfileUrl(rawUrl: string): boolean {
  try {
    parseBehanceProfileUrl(rawUrl);
    return true;
  } catch {
    return false;
  }
}
