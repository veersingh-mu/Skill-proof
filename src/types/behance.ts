/**
 * Behance evidence and profile types.
 * Follows the same conventions as github.ts for provider consistency.
 */

export type BehanceEvidenceType =
  | "behance_project"
  | "behance_project_category"
  | "behance_project_description"
  | "behance_branding"
  | "behance_logo_design"
  | "behance_graphic_design"
  | "behance_ui_design"
  | "behance_ux_design"
  | "behance_typography"
  | "behance_illustration"
  | "behance_packaging"
  | "behance_motion"
  | "behance_tool_reference";

export type EvidenceProvider = "github" | "behance";

export interface BehanceProfile {
  username: string;
  displayName: string | null;
  profileUrl: string;
  projectCount: number;
}

export interface BehanceProject {
  id: string;
  title: string;
  url: string;
  description: string | null;
  categories: string[];
  tags: string[];
  publishedAt: string | null;
  modifiedAt: string | null;
  mediaCount: number;
  coverImageUrl: string | null;
}

export interface BehanceAnalysisResult {
  analysisRunId: string;
  profile: BehanceProfile;
  projects: BehanceProject[];
  evidence: import("./github").GitHubEvidenceItem[];
  summary: {
    projectsDiscovered: number;
    projectsAnalyzed: number;
    evidenceItems: number;
    skillHintsDetected: string[];
  };
}
