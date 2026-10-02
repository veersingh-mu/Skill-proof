export const GITHUB_CONFIG = {
  ANALYZER_VERSION: "1.0.0",
  MAX_REPOSITORIES: 15,
  MAX_COMMITS_PER_REPOSITORY: 8,
  MAX_FILES_PER_REPOSITORY: 50,
  MAX_README_BYTES: 8000,
  REQUEST_TIMEOUT_MS: 15000,
  USER_AGENT: "SkillProof-EvidenceEngine/1.0",
} as const;

export const IGNORED_PATH_SEGMENTS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  "vendor",
  "venv",
  ".venv",
  "__pycache__",
  ".next",
  "target",
  ".turbo",
  "out",
] as const;
