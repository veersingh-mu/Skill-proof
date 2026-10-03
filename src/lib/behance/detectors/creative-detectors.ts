/**
 * Creative Skill Detectors for Behance project analysis.
 *
 * Each detector examines project metadata (title, description, categories, tags)
 * for observable creative evidence. Detectors do NOT determine verification status —
 * they produce structured evidence that feeds the deterministic Evidence Engine.
 */

import type { BehanceProject } from "@/types/behance";
import type { GitHubEvidenceItem, BehanceEvidenceType } from "@/types";

/** A detected creative signal from a Behance project. */
export interface CreativeDetection {
  type: BehanceEvidenceType;
  skillHints: string[];
  extractedFact: string;
}

// ---------------------------------------------------------------------------
// Keyword maps: each creative domain maps to observable keywords/phrases.
// Only the presence of these keywords in project metadata produces evidence.
// ---------------------------------------------------------------------------

const BRANDING_KEYWORDS = [
  "brand identity", "brand design", "visual identity", "corporate identity",
  "branding", "rebrand", "brand guideline", "brand book", "brand system",
  "brand strategy", "brand mark",
];

const LOGO_KEYWORDS = [
  "logo", "logotype", "logo design", "logo mark", "monogram", "wordmark",
  "lettermark", "symbol design", "icon design",
];

const GRAPHIC_DESIGN_KEYWORDS = [
  "graphic design", "poster", "flyer", "infographic", "print design",
  "marketing collateral", "banner", "layout design", "visual design",
  "editorial design", "magazine", "catalog", "brochure",
];

const UI_DESIGN_KEYWORDS = [
  "ui design", "user interface", "interface design", "app design",
  "mobile app", "dashboard", "web design", "landing page", "wireframe",
  "prototype", "mockup", "ui kit", "design system",
];

const UX_DESIGN_KEYWORDS = [
  "ux design", "user experience", "usability", "user research",
  "user flow", "persona", "journey map", "information architecture",
];

const TYPOGRAPHY_KEYWORDS = [
  "typography", "type design", "typeface", "font design", "lettering",
  "calligraphy", "type specimen", "typographic",
];

const ILLUSTRATION_KEYWORDS = [
  "illustration", "digital illustration", "character design", "concept art",
  "vector illustration", "hand drawn", "editorial illustration",
  "storyboard", "digital art", "digital painting",
];

const PACKAGING_KEYWORDS = [
  "packaging", "package design", "packaging design", "product packaging",
  "label design", "box design", "bottle design",
];

const MOTION_KEYWORDS = [
  "motion graphics", "motion design", "animation", "animated",
  "video editing", "after effects", "motion", "kinetic typography",
  "title sequence", "explainer video",
];

// Tool detection keywords
const TOOL_KEYWORDS: Record<string, string> = {
  photoshop: "Adobe Photoshop",
  "adobe photoshop": "Adobe Photoshop",
  illustrator: "Adobe Illustrator",
  "adobe illustrator": "Adobe Illustrator",
  "after effects": "Adobe After Effects",
  "adobe after effects": "Adobe After Effects",
  "adobe xd": "Adobe XD",
  figma: "Figma",
  sketch: "Sketch",
  blender: "Blender",
  canva: "Canva",
  "cinema 4d": "Cinema 4D",
  "c4d": "Cinema 4D",
  procreate: "Procreate",
  "indesign": "Adobe InDesign",
  "adobe indesign": "Adobe InDesign",
  "premiere pro": "Adobe Premiere Pro",
  "adobe premiere": "Adobe Premiere Pro",
  "lightroom": "Adobe Lightroom",
};

/**
 * Builds a searchable text corpus from project metadata.
 */
function buildSearchText(project: BehanceProject): string {
  return [
    project.title,
    project.description || "",
    ...project.categories,
    ...project.tags,
  ]
    .join(" ")
    .toLowerCase();
}

/**
 * Checks if any keyword from a list appears in the search text.
 */
function hasKeyword(searchText: string, keywords: string[]): string | null {
  for (const keyword of keywords) {
    if (searchText.includes(keyword.toLowerCase())) {
      return keyword;
    }
  }
  return null;
}

/**
 * Detects all creative evidence signals from a single Behance project.
 * Returns an array of detections — one per detected creative domain.
 */
export function detectCreativeEvidence(project: BehanceProject): CreativeDetection[] {
  const searchText = buildSearchText(project);
  const detections: CreativeDetection[] = [];

  // Branding
  const brandingMatch = hasKeyword(searchText, BRANDING_KEYWORDS);
  if (brandingMatch) {
    detections.push({
      type: "behance_branding",
      skillHints: ["Branding"],
      extractedFact: `Branding evidence detected: "${brandingMatch}" in project "${project.title}".`,
    });
  }

  // Logo Design
  const logoMatch = hasKeyword(searchText, LOGO_KEYWORDS);
  if (logoMatch) {
    detections.push({
      type: "behance_logo_design",
      skillHints: ["Logo Design"],
      extractedFact: `Logo design evidence detected: "${logoMatch}" in project "${project.title}".`,
    });
  }

  // Graphic Design
  const graphicMatch = hasKeyword(searchText, GRAPHIC_DESIGN_KEYWORDS);
  if (graphicMatch) {
    detections.push({
      type: "behance_graphic_design",
      skillHints: ["Graphic Design"],
      extractedFact: `Graphic design evidence detected: "${graphicMatch}" in project "${project.title}".`,
    });
  }

  // UI Design
  const uiMatch = hasKeyword(searchText, UI_DESIGN_KEYWORDS);
  if (uiMatch) {
    detections.push({
      type: "behance_ui_design",
      skillHints: ["UI Design"],
      extractedFact: `UI design evidence detected: "${uiMatch}" in project "${project.title}".`,
    });
  }

  // UX Design
  const uxMatch = hasKeyword(searchText, UX_DESIGN_KEYWORDS);
  if (uxMatch) {
    detections.push({
      type: "behance_ux_design",
      skillHints: ["UX Design"],
      extractedFact: `UX design evidence detected: "${uxMatch}" in project "${project.title}".`,
    });
  }

  // Typography
  const typoMatch = hasKeyword(searchText, TYPOGRAPHY_KEYWORDS);
  if (typoMatch) {
    detections.push({
      type: "behance_typography",
      skillHints: ["Typography"],
      extractedFact: `Typography evidence detected: "${typoMatch}" in project "${project.title}".`,
    });
  }

  // Illustration
  const illusMatch = hasKeyword(searchText, ILLUSTRATION_KEYWORDS);
  if (illusMatch) {
    detections.push({
      type: "behance_illustration",
      skillHints: ["Illustration"],
      extractedFact: `Illustration evidence detected: "${illusMatch}" in project "${project.title}".`,
    });
  }

  // Packaging Design
  const packMatch = hasKeyword(searchText, PACKAGING_KEYWORDS);
  if (packMatch) {
    detections.push({
      type: "behance_packaging",
      skillHints: ["Packaging Design"],
      extractedFact: `Packaging design evidence detected: "${packMatch}" in project "${project.title}".`,
    });
  }

  // Motion Graphics / Animation
  const motionMatch = hasKeyword(searchText, MOTION_KEYWORDS);
  if (motionMatch) {
    detections.push({
      type: "behance_motion",
      skillHints: ["Motion Graphics", "Animation"],
      extractedFact: `Motion/animation evidence detected: "${motionMatch}" in project "${project.title}".`,
    });
  }

  // Tool detection from project description/tags
  for (const [keyword, canonicalTool] of Object.entries(TOOL_KEYWORDS)) {
    if (searchText.includes(keyword.toLowerCase())) {
      // Avoid duplicate tool detections for the same project
      if (!detections.some((d) => d.type === "behance_tool_reference" && d.skillHints.includes(canonicalTool))) {
        detections.push({
          type: "behance_tool_reference",
          skillHints: [canonicalTool],
          extractedFact: `Tool reference "${canonicalTool}" detected in project "${project.title}" description/tags.`,
        });
      }
    }
  }

  // Category-based evidence (from Behance's own categorization)
  if (project.categories.length > 0) {
    detections.push({
      type: "behance_project_category",
      skillHints: project.categories.slice(0, 5),
      extractedFact: `Project categorized as: ${project.categories.join(", ")}.`,
    });
  }

  return detections;
}

/**
 * Converts creative detections from a project into normalized GitHubEvidenceItem[]
 * using the common evidence model with provider="behance".
 */
export function detectionsToEvidence(
  project: BehanceProject,
  detections: CreativeDetection[],
  profileUrl: string,
  candidateId?: string
): GitHubEvidenceItem[] {
  const collectedAt = new Date().toISOString();

  return detections.map((detection) => ({
    id: crypto.randomUUID(),
    candidateId,
    repositoryId: project.id,
    repositoryName: project.title,
    type: detection.type as GitHubEvidenceItem["type"],
    skillHints: detection.skillHints,
    sourceUrl: project.url,
    extractedFact: detection.extractedFact,
    collectedAt,
    analyzerVersion: "1.0.0",
    provider: "behance" as const,
    metadata: {
      projectId: project.id,
      profileUrl,
      projectTitle: project.title,
      mediaCount: project.mediaCount,
      categories: project.categories,
    },
  }));
}
