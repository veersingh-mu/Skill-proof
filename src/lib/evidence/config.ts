import type { GitHubEvidenceType } from "@/types/github";
import type { BehanceEvidenceType } from "@/types/behance";

/**
 * Deterministic Evidence Weighting Configuration
 *
 * Each evidence type is assigned a base weight reflecting the strength
 * of the technical signal:
 * - Direct source code & languages: strong direct proof of hands-on use.
 * - Dependencies & frameworks: strong direct proof of project architecture.
 * - Tests & automation: strong proof of software engineering discipline.
 * - Infrastructure (Docker, K8s, Cloud): strong proof of DevOps/deployment setup.
 * - CI/CD workflows: moderate-to-strong proof of automation.
 * - Commit recency: supporting signal showing recent engagement (not sufficient alone).
 * - Documentation/README: weak signal (mentions do not equal implementation).
 */
export const EVIDENCE_WEIGHTS: Record<GitHubEvidenceType, number> = {
  repository_language: 35,
  dependency: 30,
  framework: 30,
  test: 25,
  dockerfile: 25,
  docker_compose: 25,
  kubernetes_manifest: 25,
  cloud_configuration: 25,
  ci_cd: 20,
  package_manifest: 15,
  commit_recency: 10,
  readme: 15,
};

/**
 * Evidence weights for Behance creative evidence types.
 * Separated from GitHub weights for clarity; merged at runtime.
 *
 * Weight rationale for creative evidence:
 * - Project + domain-specific signals (branding, logo, UI): moderate-to-strong proof
 * - Tool references: supporting signal (mentions do not equal mastery)
 * - Category/description: weak contextual signal
 */
export const BEHANCE_EVIDENCE_WEIGHTS: Record<BehanceEvidenceType, number> = {
  behance_project: 15,
  behance_project_category: 10,
  behance_project_description: 10,
  behance_branding: 30,
  behance_logo_design: 30,
  behance_graphic_design: 30,
  behance_ui_design: 30,
  behance_ux_design: 30,
  behance_typography: 25,
  behance_illustration: 30,
  behance_packaging: 30,
  behance_motion: 25,
  behance_tool_reference: 15,
};

/**
 * Combined evidence weight lookup.
 */
export function getEvidenceWeight(type: string): number {
  if (type in EVIDENCE_WEIGHTS) return EVIDENCE_WEIGHTS[type as GitHubEvidenceType];
  if (type in BEHANCE_EVIDENCE_WEIGHTS) return BEHANCE_EVIDENCE_WEIGHTS[type as BehanceEvidenceType];
  return 5; // Unknown type fallback
}

/**
 * Direct technical evidence types:
 * At least one of these is required for a skill to achieve PROVEN status.
 * Pure documentation (README) or commit recency alone can NEVER satisfy this requirement.
 */
export const STRONG_TECHNICAL_TYPES = new Set<string>([
  // GitHub strong types
  "repository_language",
  "dependency",
  "framework",
  "test",
  "dockerfile",
  "docker_compose",
  "kubernetes_manifest",
  "cloud_configuration",
  "ci_cd",
  // Behance strong types — domain-specific creative evidence
  "behance_branding",
  "behance_logo_design",
  "behance_graphic_design",
  "behance_ui_design",
  "behance_ux_design",
  "behance_typography",
  "behance_illustration",
  "behance_packaging",
  "behance_motion",
]);

/**
 * Weak or contextual evidence types that cannot independently prove technical ability.
 */
export const WEAK_TYPES = new Set<string>([
  "readme",
  "commit_recency",
  // Behance weak types — contextual signals only
  "behance_project",
  "behance_project_category",
  "behance_project_description",
  "behance_tool_reference",
]);

/**
 * Minimum score threshold required for PROVEN status.
 * Numeric score alone is not enough; structural multi-signal criteria must also be met.
 */
export const PROVEN_MINIMUM_SCORE = 60;

/**
 * Minimum score threshold required for PARTIAL status.
 * Any confirmed factual evidence for a skill qualifies for at least PARTIAL.
 */
export const PARTIAL_MINIMUM_SCORE = 10;

/**
 * Multi-repository corroboration bonus:
 * Demonstrating a skill across 2 or more distinct repositories confirms consistent application.
 */
export const MULTI_REPO_BONUS_2_REPOS = 15;
export const MULTI_REPO_BONUS_3_PLUS_REPOS = 25;

/**
 * Multi-signal bonus:
 * Combining 3 or more distinct evidence types (e.g. language + dependency + tests).
 */
export const MULTI_SIGNAL_BONUS = 10;

/**
 * Diminishing returns factor for repetitive items of the same type within the same repository:
 * 1st item = 100% weight, 2nd item = 40% weight, 3rd+ items = 20% weight.
 * Prevents score inflation from large dependency manifests or repetitive log entries.
 */
export const DIMINISHING_WEIGHTS = [1.0, 0.4, 0.2];

/**
 * Safety Cap: Maximum score for README-only evidence.
 * SAFETY RULE: README mentions alone must NEVER exceed PARTIAL or score above 25.
 */
export const README_ONLY_MAX_SCORE = 25;

/**
 * Safety Cap: Maximum score for commit-only evidence.
 * SAFETY RULE: Commits alone without technical artifacts must NEVER exceed PARTIAL or score above 20.
 */
export const COMMIT_ONLY_MAX_SCORE = 20;

/**
 * Absolute maximum score for any skill.
 */
export const MAX_EVIDENCE_SCORE = 100;
