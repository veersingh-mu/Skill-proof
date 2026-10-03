/**
 * Behance Provider Configuration.
 * Configurable limits to prevent excessive processing.
 */
export const BEHANCE_CONFIG = {
  ANALYZER_VERSION: "1.0.0",
  MAX_PROJECTS: 15,
  MAX_MEDIA_PER_PROJECT: 20,
  MAX_AI_MEDIA_ANALYSIS: 60,
  REQUEST_TIMEOUT_MS: 15000,
  USER_AGENT: "SkillProof-EvidenceEngine/1.0",
  ALLOWED_DOMAINS: ["www.behance.net", "behance.net"] as readonly string[],
  /** Maximum response body size in bytes (5 MB) */
  MAX_RESPONSE_BYTES: 5 * 1024 * 1024,
} as const;
